var ruleta = document.getElementById("ruleta");
var puntero = document.getElementById("puntero");
var ruleta_title = document.getElementById("ruleta_title");
var presentamos_title = document.getElementById("presentamos_title");
var tooltip = document.getElementById("tooltip");
var tooltip_text= document.getElementById("tooltip_text");
var whip_sound = document.getElementById("whip_sound");
var win_sound = document.getElementById("win_sound");

let gira = 0;
let index = 0;

let colors = []
colors[1] = "tp-orange";
colors[2] = "tp-verde";
colors[3] = "tp-marron";
colors[4] = "tp-blue";

let titles = []
titles[1]= "NEGOCIO & MARCAS";
titles[2]= "PEOPLE PARA DISTRIBUIDORES";
titles[3]= "CRECIMIENTO INCLUSIVO & SUSTENTABILIDAD";
titles[4]= "INNOVACIÓN & TECNOLOGÍA";

//Rueda la ruleta
puntero.addEventListener("mousedown", function(){
  if(index == 0) return;
  whip_sound.play();
  portion = 225;
  gira= (portion * 2 * index) + portion + (portion * 8);
  puntero.style.pointerEvents='none';
  ruleta.style.transition='all 5s ease-out';
  ruleta.style.transform=`rotate(${gira}deg)`; 
});  

//Fin de la rodada
ruleta.addEventListener("transitionend", function(){
  win_sound.play();
  ruleta_title.hidden = true;
  presentamos_title.hidden = true;
  tooltip.hidden = false;
  tooltip.classList.add(colors[index]);
  tooltip_text.innerHTML = titles[index];
  setTimeout(() => {
    window.location.href = 'trivia.php';
  }, 4000);
});

function FetchGameType()
{
    $(document).ready(function(){
        $.post("ajax/get-game-type.php", {}, function(data){
            data = JSON.parse(data);
            index = data["game_type"];
        });
    });
}

FetchGameType();