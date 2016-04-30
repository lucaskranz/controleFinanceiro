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
            alert('Sucesso!', 'Sucesso');
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

function BuscarCategoria() {
    BancoDados.transaction(
        function (e){
            e.executeSql('SELECT * FROM categoria', [], ResultadoCategoria, 
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

function ResultadoCategoria(e, results){
    var len = results.rows.length, texto = "";
    for (var i=0; i<len; i++){
       texto += "Id = " + results.rows.item(i).id + " Descrição =  " + results.rows.item(i).descricao + " Tipo =  " + results.rows.item(i).tipo + "\n";
    }
    alert(texto, 'Categoria');
}
