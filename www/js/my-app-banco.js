
//###################################################################
//                   Funções de inicialização
//###################################################################

document.addEventListener('deviceready', onDeviceReady, false);
var BancoDados;
function onDeviceReady() {
	BancoDados = window.openDatabase("controlefinanceiro", "1.0", "Controle Financeiro", 1000000); // 1 mega de tamanho

    // crias as tabelas se não existe
    BancoDados.transaction(
        function (e){
            //e.executeSql('DROP table receita_despesa');
            e.executeSql('CREATE TABLE IF NOT EXISTS categoria (id INTEGER PRIMARY KEY, descricao INTEGER, tipo INTEGER);');
            e.executeSql('CREATE TABLE IF NOT EXISTS receita_despesa (id INTEGER PRIMARY KEY, tipo INTEGER, categoria INTEGER, valor NUMERIC, data TEXT, quantidade_parcelas INTEGER, observacao TEXT, FOREIGN KEY(categoria) REFERENCES categoria(id));');
        }, 
        function(erro){
            AlertToast('Erro ao iniciar o banco de dados!', 'Erro');
        }, 
        function(){
            // sucesso, criou as tabelas se não existiam
            // agora vamos inserir as categorias padrões
            
            VerificaCountCategoria();
        }
    );
}

function VerificaCountCategoria(){
    var contador = 1; // um porque se der erro não cria nada no banco
    BancoDados.transaction(
        function (e){
            e.executeSql('SELECT count(1) as c FROM categoria', [], 
                function (e, results){
                    contador = results.rows.item(0).c;
                    if (contador <= 0){ 
                        // se não tem categoria nenhuma, insere as padrões
                        InsereCategoriasPadroes();
                    }
                }, 
                function(erro){
                    AlertToast("Erro ao inserir as categorias padrões!", 'Erro');
                }
            );
        },  
        function(erro){
            AlertToast("Erro ao inserir as categorias padrões!", 'Erro');
        }
    );
}

function InsereCategoriasPadroes(){
    BancoDados.transaction(
        function (e){
            e.executeSql('INSERT INTO categoria (descricao, tipo) VALUES ("Salário", 2)');
            e.executeSql('INSERT INTO categoria (descricao, tipo) VALUES ("Mercado", 1)');
            e.executeSql('INSERT INTO categoria (descricao, tipo) VALUES ("Alimentação", 1)');
            e.executeSql('INSERT INTO categoria (descricao, tipo) VALUES ("Combustível", 1)');
            e.executeSql('INSERT INTO categoria (descricao, tipo) VALUES ("Moradia", 1)');
            e.executeSql('INSERT INTO categoria (descricao, tipo) VALUES ("Saúde", 1)');
        }, 
        function(erro){
            AlertToast('Erro ao inserir as categorias padrões!', 'Erro');
        }
    );
}

//###################################################################
//                   Funções que salvam
//###################################################################

// Tipo terá duas opções:
// 1 - Despesa
// 2 - Receita
function SalvarCategoria(id, descricao, tipo){
    BancoDados.transaction(
        function (e){
            if(id > 0) {
                e.executeSql('UPDATE categoria SET descricao = "' + descricao + '", tipo = ' + tipo + ' WHERE id = ' + id);
            } else {
                e.executeSql('INSERT INTO categoria (descricao, tipo) VALUES ("' + descricao + '", ' + tipo + ')');
            }
        }, 
        function(erro){
            AlertToast('Erro ao salvar!', 'Erro');
            //AlertToast(erro.code + ' / ' + erro.message);
        }, 
        function(){
            AlertToast('Salvo com sucesso!', 'Sucesso');
        }
    );
}

function SalvarReceitaDespesa(id, tipo, categoria, valor, data, qtdParcelas, observacao){
    BancoDados.transaction(
        function (e){
            var comando = "", dataConcat = "", res = data.split('/'), diaAux = res[0], dia = res[0], mes = parseInt(res[1]), ano = parseInt(res[2]);

            for(var i = 0; i < qtdParcelas; i++){
                
                if (mes.toString().length == 1)
                    dataConcat = dia + '/' + '0'+mes + '/' + ano;
                else
                    dataConcat = dia + '/' + mes + '/' + ano;

                if(id > 0) {
                    comando = 'UPDATE receita_despesa SET categoria = ' + categoria + ', valor = ' + (valor/qtdParcelas) + ', data = "' + dataConcat + '", quantidade_parcelas = ' + quantidade_parcelas + ', observacao = "' + observacao + '" WHERE id =' + id;
                } else {
                    comando = 'INSERT INTO receita_despesa (tipo, categoria, valor, data, quantidade_parcelas, observacao) VALUES (' + tipo + ', ' + categoria + ', ' + (valor/qtdParcelas) + ', "' + dataConcat + '", ' + qtdParcelas + ', "' + observacao + '")';
                }
                e.executeSql(comando); 
                if(mes == 12){
                    mes = 1;
                    ano++;
                }
                else
                    mes++;

                if ((mes == 4 || mes == 6 || mes == 9 || mes == 11) && (parseInt(dia) > 30))
                    dia = '30';       
                else if(mes == 2 && parseInt(dia) > 28)
                    dia = '28';
                else
                    dia = diaAux; 
            }
        }, 
        function(erro){
            AlertToast('Erro ao salvar!', 'Erro');
        }, 
        function(){
            AlertToast('Salvo com sucesso!', 'Sucesso');
        }
    );
}

//###################################################################
//                   Funções que buscam
//###################################################################

function BuscarCategoria(callback, tipo) {
    BancoDados.transaction(
        function (e){
            var sql = "";
            if (tipo > 0){
                sql = 'SELECT * FROM categoria WHERE tipo = ' + tipo;
            }else{
                sql = 'SELECT * FROM categoria'; 
            }
            e.executeSql(sql, [], 
                function (e, results){
                    var len = results.rows.length;
                    var resultado = new Array();
                    for (var i=0; i<len; i++){
                        var linha = {Id: results.rows.item(i).id, Descricao: results.rows.item(i).descricao, Tipo: results.rows.item(i).tipo};
                        resultado.push(linha);
                    }
                    callback(resultado);
                }, 
                function(erro){
                    AlertToast("Erro ao buscar as categorias!", 'Erro');
                }
            );
        },  
        function(erro){
            AlertToast("Erro ao buscar as categorias!", 'Erro');
            //alert(erro.code + ' / ' + erro.message);
        }
    );
}

function TotalReceitaDespesa(callback, dataInicial, dataFinal, categoria){
    var query='SELECT SUM(valor) AS total, tipo FROM receita_despesa';
    BancoDados.transaction(
        function (e){
            if(dataInicial != '' && dataFinal != ''){
                query += ' WHERE data >="' + dataInicial + '" and data <= "' + dataFinal + '"';
            }
            if(categoria != 0){
                query += ' and categoria = ' + categoria;
            }

            query += ' GROUP BY tipo';

            e.executeSql(query, [], 
                function (e, results){
                    var len = results.rows.length, texto = "";
                    var totalDespesa=0;
                    var totalReceita=0;

                    for (var i=0; i<len; i++){ 
                        if (results.rows.item(i).tipo == 1) // despesa
                            totalDespesa=results.rows.item(i).total;    
                        else // receita
                            totalReceita=results.rows.item(i).total;
                    }     
                    

                    callback(totalReceita, totalDespesa);
                },
                function(erro){
                    AlertToast("Erro ao buscar os totais!", 'Erro');
                }
            );            
        },
        function(erro){
            AlertToast("Erro ao buscar os totais!", 'Erro');
        }

    );                      
}

function BuscarReceitaDespesa(callback, dataInicial, dataFinal, categoria, tipo) {
    BancoDados.transaction(
        function (e){
            var query = 'SELECT rd.Id as Id, rd.tipo, rd.valor, rd.data, rd.quantidade_parcelas, rd.observacao, c.descricao FROM receita_despesa rd inner join categoria c on c.id = rd.categoria ';
            var filter = "";
            if (dataInicial != '' && dataFinal != '') {
                filter += "WHERE data >= '" + dataInicial + "' and data <= '" + dataFinal + "'";
            }
            if (categoria != 0) {
                if (filter == "") {
                    filter += ' where categoria = ' + categoria;
                } else {
                    filter += ' and categoria = ' + categoria;
                }
            }
            if (tipo != 0) {
                if (filter == "") {
                    filter += ' where rd.tipo = ' + tipo;
                } else {
                    filter += ' and rd.tipo = ' + tipo;
                }
            }
            query += filter;
            e.executeSql(query, [], 
                function (e, results){
                    var len = results.rows.length;
                    var resultado = new Array();
                    for (var i=0; i<len; i++){
                        var linha = {Id: results.rows.item(i).Id, Tipo: results.rows.item(i).tipo, Valor: results.rows.item(i).valor, Data: results.rows.item(i).data, QuantidadeParcelas: results.rows.item(i).quantidade_parcelas, Observacao: results.rows.item(i).observacao, Categoria: results.rows.item(i).descricao};
                        resultado.push(linha);
                    }
                    callback(resultado);
                }, 
                function(erro){
                    AlertToast("Erro ao buscar!", 'Erro');
                    //Alert(erro.code + ' / ' + erro.message);
                }
            );
        },  
        function(erro){
            AlertToast("Erro ao buscar!", 'Erro');
            //Alert(erro.code + ' / ' + erro.message);
        }
    );
}

function BuscarReceitaDespesaPorId(callback, id) {
    BancoDados.transaction(
        function (e){
            var query = 'SELECT id as Id, tipo, categoria, valor, data, quantidade_parcelas, observacao FROM receita_despesa WHERE id = ' + id;
            e.executeSql(query, [], 
                function (e, results){
                    var len = results.rows.length;
                    if (len > 0){
                        var resultado = {
                            Id: results.rows.item(0).Id, 
                            Tipo: results.rows.item(0).tipo, 
                            Categoria: results.rows.item(0).categoria,
                            Valor: results.rows.item(0).valor, 
                            Data: results.rows.item(0).data, 
                            QuantidadeParcelas: results.rows.item(0).quantidade_parcelas, 
                            Observacao: results.rows.item(0).observacao};

                            callback(resultado);
                    }else{
                        AlertToast("Receita/Despesa inválida!", 'Erro');
                    }
                }, 
                function(erro){
                    AlertToast("Erro ao buscar!", 'Erro');
                }
            );
        },  
        function(erro){
            AlertToast("Erro ao buscar!", 'Erro');
        }
    );
}

//###################################################################
//                   Funções que excluem
//###################################################################

function ExcluiReceitaDespesa(id){
    BancoDados.transaction(
        function (e){
            if(id > 0) {
                e.executeSql('DELETE FROM receita_despesa WHERE id = ' + id);
            }
        }, 
        function(erro){
            AlertToast('Erro ao excluir!', 'Erro');
            //AlertToast(erro.code + ' / ' + erro.message);
        }, 
        function(){
            AlertToast('Excluido com sucesso!', 'Sucesso');
        }
    );
}

