
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
    BancoDados.transaction(
        function (e){
            if(id > 0) {
                e.executeSql('UPDATE categoria SET descricao = "' + descricao + '", tipo = ' + tipo + ' WHERE id = ' + id);
            } else {
                e.executeSql('INSERT INTO categoria (descricao, tipo) VALUES ("' + descricao + '", ' + tipo + ')');
            }
        }, 
        function(erro){
            myApp.alert('Erro ao salvar!', 'Erro');
            //myApp.alert(erro.code + ' / ' + erro.message);
        }, 
        function(){
            myApp.alert('Salvo com sucesso!', 'Sucesso');
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
            myApp.alert('Erro ao salvar!', 'Erro');
            //myApp.alert(erro.code + ' / ' + erro.message);
        }, 
        function(){
            myApp.alert('Salvo com sucesso!', 'Sucesso');
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
                    myApp.alert("Erro ao buscar as categoria!", 'Erro');
                }
            );
        },  
        function(erro){
            myApp.alert("Erro ao buscar as categoria!", 'Erro');
        }
    );
}

function BuscarReceitaDespesa() {
    BancoDados.transaction(
        function (e){
            e.executeSql('SELECT * FROM receita_despesa', [], ResultadoReceitaDespesa, 
                function(erro){
                    myApp.alert("Erro ao buscar!", 'Erro');
                }
            );
        },  
        function(erro){
            myApp.alert("Erro ao buscar!", 'Erro');
        }
    );
}

function ResultadoReceitaDespesa(e, results){
    var len = results.rows.length;
    var texto = "";
    for (var i=0; i<len; i++){
       texto += "Id = " + results.rows.item(i).id + " Categoria =  " + results.rows.item(i).categoria + " Data =  " + results.rows.item(i).data + " Valor =  " + results.rows.item(i).valor + "\n";
    }
    myApp.alert(texto, 'receita despesa');
}
