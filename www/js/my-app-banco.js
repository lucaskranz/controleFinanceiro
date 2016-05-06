
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
            e.executeSql('CREATE TABLE IF NOT EXISTS categoria (id INTEGER PRIMARY KEY, descricao INTEGER, tipo INTEGER);');
            e.executeSql('CREATE TABLE IF NOT EXISTS receita_despesa (id INTEGER PRIMARY KEY, tipo INTEGER, categoria INTEGER, valor NUMERIC, data TEXT, quantidade_parcelas INTEGER, observacao TEXT, FOREIGN KEY(categoria) REFERENCES categoria(id));');
        }, 
        function(erro){
            alert('Erro ao iniciar o banco de dados!', 'Erro');
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
                    myApp.alert("Erro ao inserir as categorias padrões!", 'Erro');
                }
            );
        },  
        function(erro){
            myApp.alert("Erro ao inserir as categorias padrões!", 'Erro');
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
            alert('Erro ao inserir as categorias padrões!', 'Erro');
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
            alert(id);
    BancoDados.transaction(
        function (e){
    
            if(id > 0) {
                alert("maior que 0");
                e.executeSql('UPDATE categoria SET descricao = "' + descricao + '", tipo = ' + tipo + ' WHERE id = ' + id);
            } else {
                alert("inserindo categoria");
                e.executeSql('INSERT INTO categoria (descricao, tipo) VALUES ("' + descricao + '", ' + tipo + ')');
            }
        }, 
        function(erro){
            alert('Erro ao salvar!', 'Erro');
            //alert(erro.code + ' / ' + erro.message);
        }, 
        function(){
            alert('Salvo com sucesso!', 'Sucesso');
        }
    );
}

function SalvarReceitaDespesa(id, tipo, categoria, valor, data, qtdParcelas, observacao){
    BancoDados.transaction(
        function (e){
            var comando = "";
            if(id > 0) {
                comando = 'UPDATE receita_despesa SET categoria = ' + categoria + ', valor = ' + valor + ', data = "' + data + '", quantidade_parcelas = ' + quantidade_parcelas + ', observacao = "' + observacao + '" WHERE id =' + id;
            } else {
                comando = 'INSERT INTO receita_despesa (tipo, categoria, valor, data, quantidade_parcelas, observacao) VALUES (' + tipo + ', ' + categoria + ', ' + valor + ', "' + data + '", ' + qtdParcelas + ', "' + observacao + '")';
            }
            alert(comando);
            e.executeSql(comando);
        }, 
        function(erro){
            alert('Erro ao salvar!', 'Erro');
            //alert(erro.code + ' / ' + erro.message);
        }, 
        function(){
            alert('Salvo com sucesso!', 'Sucesso');
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
                sql = 'SELECT * FROM categoria WHERE tipo = ' + tipo
            }else{
                sql = 'SELECT * FROM categoria'
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
<<<<<<< .mine
                    myApp.alert("Erro ao buscar as categoria!", 'Erro');
                    alert("Erro ao buscar!", 'Erro');
=======
                    alert("Erro ao buscar as categoria!", 'Erro');

>>>>>>> .theirs
                }
<<<<<<< .mine
        );
    }





=======
            );
        },  
        function(erro){
            alert("Erro ao buscar as categoria!", 'Erro');
        }
    );
}
>>>>>>> .theirs

function TotalReceitaDespesa(dataInicial, dataFinal, categoria){
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

            e.executeSql(query, [], ResultadoTotalReceitaDespesa,
                function(erro){
                    alert("Erro ao buscar!", 'Erro');
                }
            );            
        }                        
    );                  
}

function BuscarReceitaDespesa(dataInicial, dataFinal, categoria, tipo) {
    var query = 'SELECT * FROM receita_despesa ';
    BancoDados.transaction(
        function (e){
            if(dataInicial != '' && dataFinal != ''){
                query += 'WHERE data >="' + dataInicial + '" and data <= "' + dataFinal + '"';
            }
            if(categoria != 0){
                query += ' and categoria = ' + categoria;
            }
            if(tipo != 0){
                query += ' and tipo = ' + tipo;
            }
            e.executeSql(query, [], ResultadoReceitaDespesa, 
                function(erro){
                    alert("Erro ao buscar!", 'Erro');
                }
            );
        },  
        function(erro){
            alert("Erro ao buscar!", 'Erro');
        }
    );
}

function ResultadoTotalReceitaDespesa(e, results){
    var len = results.rows.length, texto = "";
    
    for (var i=0; i<len; i++){ 
        if (results.rows.item(i).tipo == 1) // despesa
            texto += "Despesa = " + results.rows.item(i).total + "\n";    
        else // receita
            texto += "Receita = " + results.rows.item(i).total + "\n";
    }     
    if (len == 1 && results.rows.item(0).tipo == 1)
        texto += "Receita = 0";
    else if (len == 1 && results.rows.item(0).tipo == 2)
        texto += "Despesa = 0";

    alert(texto);
}

function ResultadoReceitaDespesa(e, results){
    var len = results.rows.length, texto = "";
    for (var i=0; i<len; i++){
        texto += "Id = " + results.rows.item(i).id + " Categoria =  " + results.rows.item(i).categoria + " Data =  " + results.rows.item(i).data + " Valor =  " + results.rows.item(i).valor + "\n";
    }
    alert(texto, 'receita despesa');
}
<<<<<<< .mine

function ResultadoCategoria(e, results){
    var len = results.rows.length, texto = "";
    for (var i=0; i<len; i++){
       texto += "Id = " + results.rows.item(i).id + " Descrição =  " + results.rows.item(i).descricao + " Tipo =  " + results.rows.item(i).tipo + "\n";
    }
    alert(texto, 'Categoria');
}
=======








>>>>>>> .theirs
