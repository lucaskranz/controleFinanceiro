// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

// Add views
var view1 = myApp.addView('#view-1');
var view2 = myApp.addView('#view-2', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});
var view3 = myApp.addView('#view-3');
var view4 = myApp.addView('#view-4');


document.addEventListener('deviceready', onDeviceReady, false);
var BancoDados;
function onDeviceReady() {
	BancoDados = window.openDatabase("controlefinanceiro", "1.0", "Controle Financeiro", 1000000); // 1 mega de tamanho
}

function SalvarDespesa(){
    BancoDados.transaction(InsereDespesaNoBanco, 
		function(erro){
	    	alert("Erro ao salvar a despesa!");
	    }, 
	    function(){
	    	alert("Salvo com sucesso!");
		}
  	);
}

function InsereDespesaNoBanco(e){
	var descricao = "Teste";
        		
	e.executeSql('CREATE TABLE IF NOT EXISTS despesa (id INTEGER PRIMARY KEY, descricao TEXT)');
    e.executeSql('INSERT INTO despesa (descricao) VALUES (' + descricao + ')');
}

function BuscarDespesa() {
        		BancoDados.transaction(BuscarDespesaNoBanco, 
        			function(erro){
        				alert("Erro ao buscar a despesa!");
        			}
        		);
        	}
        	function BuscarDespesaNoBanco(e){
			    e.executeSql('SELECT * FROM despesa', [], ResultadoDespesa, 
			    	function(erro){
        				alert("Erro ao buscar a despesa!");
        			}
        		);
        	}
        	function ResultadoDespesa(e, results){
        		var len = results.rows.length;
        		var texto = "";
	            for (var i=0; i<len; i++){
	                texto += "Id = " + results.rows.item(i).id + " descricao =  " + results.rows.item(i).descricao + "\n";
	            }
	            alert(texto);
        	}