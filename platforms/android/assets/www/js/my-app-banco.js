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
            myApp.alert('Erro ao iniciar o banco de dados!', 'Erro');
        }
    );
}

//###################################################################
//                   Funções que salvam
//###################################################################

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

function BuscarCategoria() {
    BancoDados.transaction(
        function (e){
            e.executeSql('SELECT * FROM categoria', [], ResultadoCategoria, 
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

function ResultadoCategoria(e, results){
    var len = results.rows.length;
    var texto = "";
    for (var i=0; i<len; i++){
       texto += "Id = " + results.rows.item(i).id + " Descrição =  " + results.rows.item(i).descricao + " Tipo =  " + results.rows.item(i).tipo + "\n";
    }
    myApp.alert(texto, 'Categoria');
}
