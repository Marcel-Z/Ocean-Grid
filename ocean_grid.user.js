// ==UserScript==
// @name		Grepotools.nl | Ocean Grid
// @namespace	https://www.grepotools.nl/ocean_grid
// @version		1.0
// @author		Marcel_Z
// @description Grepotools.nl | Ocean Grid | Een grid systeem voor de Grepolis wereldkaart
// @match       http://*.grepolis.com/game/*
// @match       https://*.grepolis.com/game/*
// @match		https://*grepotools.nl/*
// @updateURL   https://www.grepotools.nl/ocean_grid/script/ocean_grid.user.js
// @downloadURL	https://www.grepotools.nl/ocean_grid/script/ocean_grid.user.js
// @require		https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @icon		https://www.grepotools.nl/ocean_grid/icon/ocean_grid_setup_icon.png
// @icon64		https://www.grepotools.nl/ocean_grid/icon/ocean_grid_logo.jpg
// @copyright	2022 Marcel_Z
// @license     GPL-3.0-or-later; https://www.gnu.org/licenses/gpl-3.0.txt
// @grant		GM_setValue
// @grant		GM_getValue
// @grant		GM_deleteValue
// @grant		GM_xmlhttpRequest
// @grant       GM_getResourceText
// @grant       GM_addStyle
// ==/UserScript==

// Ocean Grid style
GM_addStyle(`
.og_info{
    top: 485px;
    z-index: 0;
    position: absolute;
}

.og_border_right {
  border-right-width: 3px;
  border-right-style: solid;
  position: absolute;
  z-index: 5;
  opacity: .5;
}

.og_border_bottom {
  border-bottom-width: 3px;
  border-bottom-style: solid;
  position: absolute;
  z-index: 5;
  opacity: .5;
}

.og_border{
  border-width: 3px;
  border-style: solid;
  position: absolute;
  z-index: 5;
  opacity: .5;
}

.og_text {
  position: absolute;
  text-align: left;
  z-index: 5;
  opacity: 1;
  text-align: left;
  font-size: 15px;
  width: 75px;
  height: 30px;
}
og_instelling_grid_zichtbaar{
  margin-bottom:5px;
}

#og_instelling_grid_verdeling{
  width:100px !important;
  left:10px;
  margin-bottom:5px;
}

#og_instelling_grid_tekst_kleur{
  width:100px !important;
  left:10px;
  margin-bottom:5px;
}

#og_instelling_grid_kleur{
  width:100px !important;
  left:10px;
  margin-bottom:5px;
}

#og_menu_achtergrond{
background: url(https://www.grepotools.nl/ocean_grid/afbeeldingen/ocean_grid_background.png) no-repeat;
    height: 303px;
    width: 563px;
    right: -10px;
    top: 225px;
    z-index: -1;
    background-size: 100% auto;
    position: absolute;
}
`);

// Global var | Ocean Grid
var og_versie = "1.0";
var og_oceaan_afmeting = 2560;
var og_aantal_rasters;
var og_grid_html;
var og_raster_letters =["A","B","C","D","E","F","G","H","I","J"];
var og_raster_stap;
var og_raster_zichtbaar;
var og_raster_oc; 
var og_raster_grootte = {min: 2, max: 10};
var og_menu_zichtbaar=0;
var og_temp_waarde_instelling_select_01; // grid raster
var og_temp_waarde_instelling_select_02; // grid tekst kleur
var og_temp_waarde_instelling_select_03; // grid raster kleur
var og_datum = new Date();
var og_raster_kleur_tekst;
var og_instelling_grid_tekst_kleur;
var og_raster_kleur;
var og_instelling_grid_kleur;

//Globar var | Grepolis
var grepo_world_data;
var grepo_taal;
var grepolis_game_data = unsafeWindow;

var uw = unsafeWindow || window, $ = uw.jQuery || jQuery, DATA, GM;

// Vertaling [ nl | en | us | de | fr | it | pl | ru ]
var vertaling = {
    nl: {
        instellingen:"Instellingen",
        actief:"Actief",
        versie:"Versie",
        wereld:"Wereld",
        taal:"Taal",
        og_instelling_grid_zichtbaar:"Grid zichtbaar op de strategische kaart",
        og_instelling_grid_verdeling:"Grid (aantal vakken)",
        og_instelling_grid_oceanen:"Grid tonen op de onderstaande oceanen (typ de oceanen gescheiden door een komma)",
        og_instelling_grid_oceanen_voorbeeld:"Voorbeeld : (oc 54 -> 54 | oc 54 + oc 55 -> 54, 55)",
        og_instelling_grid_tekst_kleur:"Grid tekst kleur",
        og_instelling_grid_kleur:"Grid kleur",
        og_instelling_kleuren: {
            wit:"wit",
            grijs:"grijs",
            zwart:"zwart",
            rood:"rood",
            geel:"geel",
            blauw:"blauw",
            groen:"groen",
            paars:"paars",
            bruin:"bruin",
        },
    },

    en: {
        instellingen:"Settings",
        actief:"Active",
        versie:"Version",
        wereld:"World",
        taal:"Language",
        og_instelling_grid_zichtbaar:"Grid visible on the strategic map",
        og_instelling_grid_verdeling:"Grid (number of sectors)",
        og_instelling_grid_oceanen:"Show grid on the oceans below (type the oceans separated by a comma)",
        og_instelling_grid_oceanen_voorbeeld:"Example : (oc 54 -> 54 | oc 54 + oc 55 -> 54, 55)",
        og_instelling_grid_tekst_kleur:"Grid text colour",
        og_instelling_grid_kleur:"Grid colour",
        og_instelling_kleuren: {
            wit:"white",
            grijs:"grey",
            zwart:"black",
            rood:"red",
            geel:"yellow",
            blauw:"blue",
            groen:"green",
            paars:"purple",
            bruin:"brown",
        },
    },

    us:{
    },

    de: {
        instellingen:"Einstellungen",
        actief:"Aktiv",
        versie:"Ausführung",
        wereld:"Welt",
        taal:"Sprache",
        og_instelling_grid_zichtbaar:"Auf der strategischen Karte sichtbares Raster",
        og_instelling_grid_verdeling:"Raster (Anzahl Kästchen)",
        og_instelling_grid_oceanen:"Rasteranzeige auf den Ozeanen unten (geben Sie die Ozeane durch ein Komma getrennt ein)",
        og_instelling_grid_oceanen_voorbeeld:"Beispiel: (ok 54 -> 54 | ok 54 + ok 55 -> 54, 55)",
        og_instelling_grid_tekst_kleur:"Raster text farbe",
        og_instelling_grid_kleur:"Raster farbe",
        og_instelling_kleuren: {
            wit:"weiß",
            grijs:"grau",
            zwart:"schwarz",
            rood:"rot",
            geel:"gelb",
            blauw:"blau",
            groen:"grün",
            paars:"violett",
            bruin:"braun",
        },
    },

    fr: {
        instellingen:"Réglages",
        actief:"Actif",
        versie:"Version",
        wereld:"Monde",
        taal:"Langue",
        og_instelling_grid_zichtbaar:"Grille visible sur la carte stratégique",
        og_instelling_grid_verdeling:"Grille (nombre de cases)",
        og_instelling_grid_oceanen:"Mostra la griglia sugli oceani sottostanti (digita gli oceani separati da una virgola)",
        og_instelling_grid_oceanen_voorbeeld:"Exemple : (oc 54 -> 54 | oc 54 + oc 55 -> 54, 55)",
        og_instelling_grid_tekst_kleur:"Couleur du texte de la grille",
        og_instelling_grid_kleur:"Couleur de la grille",
        og_instelling_kleuren: {
            wit:"blanche",
            grijs:"grise",
            zwart:"le noir",
            rood:"rouge",
            geel:"jaune",
            blauw:"bleu",
            groen:"vert",
            paars:"violet",
            bruin:"brun",
        },
    },

    it: {
        instellingen:"Impostazioni",
        actief:"Attivo",
        versie:"Versione",
        wereld:"Mondo",
        taal:"Linguaggio",
        og_instelling_grid_zichtbaar:"Griglia visibile sulla mappa strategica",
        og_instelling_grid_verdeling:"Griglia (numero di caselle)",
        og_instelling_grid_oceanen:"Afficher la grille sur les océans ci-dessous (tapez les océans séparés par une virgule)",
        og_instelling_grid_oceanen_voorbeeld:"Esempio : (oc 54 -> 54 | oc 54 + oc 55 -> 54, 55)",
        og_instelling_grid_tekst_kleur:"Colore del testo della griglia",
        og_instelling_grid_kleur:"Colore della griglia",
        og_instelling_kleuren: {
            wit:"bianca",
            grijs:"grigio",
            zwart:"nero",
            rood:"rosso",
            geel:"giallo",
            blauw:"blu",
            groen:"verde",
            paars:"viola",
            bruin:"marrone",
        },
    },

    pl: {
        instellingen:"Ustawienia",
        actief:"Aktywny",
        versie:"Wersja",
        wereld:"Świat",
        taal:"Język",
        og_instelling_grid_zichtbaar:"Siatka widoczna na mapie strategicznej",
        og_instelling_grid_verdeling:"Siatka (liczba sektorów)",
        og_instelling_grid_oceanen:"Pokaż siatkę oceanów poniżej (wpisz oceany oddzielone przecinkiem)",
        og_instelling_grid_oceanen_voorbeeld:"Przykład: (o 54 -> 54 | o 54 + o 55 -> 54, 55)",
        og_instelling_grid_tekst_kleur:"Kolor tekstu siatki",
        og_instelling_grid_kleur:"Kolor siatki",
        og_instelling_kleuren: {
            wit:"biały",
            grijs:"szary",
            zwart:"czarny",
            rood:"czerwony",
            geel:"żółty",
            blauw:"niebieski",
            groen:"zielony",
            paars:"fioletowy",
            bruin:"brązowy",
        },
    },

    ru: {
        instellingen:"Настройки",
        actief:"Активный",
        versie:"Версия",
        wereld:"Мир",
        taal:"Язык",
        og_instelling_grid_zichtbaar:"Сетка видна на стратегической карте",
        og_instelling_grid_verdeling:"Сетка (количество ящиков)",
        og_instelling_grid_oceanen:"Показать сетку океанов ниже (введите океаны через запятую)",
        og_instelling_grid_oceanen_voorbeeld:"Пример: (ос 54 -> 54 | ос 54 + ос 55 -> 54, 55)",
        og_instelling_grid_tekst_kleur:"Цвет текста сетки",
        og_instelling_grid_kleur:"Цвет сетки",
        og_instelling_kleuren: {
            wit:"белый",
            grijs:"серый",
            zwart:"черный",
            rood:"красный",
            geel:"желтый",
            blauw:"синий",
            groen:"зеленый",
            paars:"пурпурный",
            bruin:"коричневый",
        },
    },
}

$( document ).ready(function() {
    laad_grepolis_game_data(); // Grepolis wereld data opvragen

    // Taal niet bekend, wordt ingesteld op engels
    vertaling.us = vertaling.en;
    if(!(vertaling[grepo_taal])){
        grepo_taal="en";
    }
    console.log ("Grepolis Ocean Grid: "+vertaling[grepo_taal].actief+" | "+vertaling[grepo_taal].versie+": "+og_versie+" | "+vertaling[grepo_taal].wereld+": "+grepo_world_data+" | "+vertaling[grepo_taal].taal+": "+grepo_taal);

    laad_instellingen(); // instellingen laden

    instellingen_icoon(); // Instellingen icoon Gods area

    toetsenbord_bediening (); // Bediening grid met toetsenbord

    setInterval(grid_id, 100); // Grid id plaatsen en aan/uit zetten
    setInterval(loop_instellingen_venster, 100); // Functies instellingen menu venster
})

function toetsenbord_bediening (){
    document.addEventListener('keydown', toetsInput => {

        // aantal rasters verlagen
        if (toetsInput.key === ',' && toetsInput.altKey) {
            if (og_aantal_rasters > 2) {
                og_aantal_rasters --;
                safe_instellingen ();
                grid_tekenen ();
            }
        }

        // Aantal rasters verhogen
        if (toetsInput.key === '.' && toetsInput.altKey) {
            if (og_aantal_rasters < 10) {
                og_aantal_rasters ++;
                safe_instellingen ();
                grid_tekenen ();
            }
        }

        // Raster aan of uitzetten
        if (toetsInput.key === '/' && toetsInput.altKey) {
            if (og_raster_zichtbaar==1){
                og_raster_zichtbaar=0;
                $("#og_kaart_oceangrid").css('opacity', '0');
            } else {
                og_raster_zichtbaar=1;
                $("#og_kaart_oceangrid").css('opacity', '1');
            }
            safe_instellingen ();
        }
    });
}

function laad_grepolis_game_data(){
    grepo_world_data = grepolis_game_data.Game.world_id;
    grepo_taal = grepolis_game_data.Game.market_id;
}

// alle ocean grid instellingen laden
function laad_instellingen (){
    og_aantal_rasters = loadValue("og_aantal_rasters", 5);
    og_raster_zichtbaar = loadValue("og_raster_zichtbaar", 1);
    og_raster_oc = loadValue("og_raster_oc","");
    og_raster_kleur_tekst = loadValue("og_raster_kleur_tekst","grijs");
    og_raster_kleur = loadValue("og_raster_kleur","grijs");
}

// alle ocean grid instellingen opslaan
function safe_instellingen (){
    saveValue("og_aantal_rasters", og_aantal_rasters);
    saveValue("og_raster_zichtbaar", og_raster_zichtbaar);
    saveValue("og_raster_oc", og_raster_oc);
    saveValue("og_raster_kleur_tekst", og_raster_kleur_tekst);
    saveValue("og_raster_kleur", og_raster_kleur);
}

// GM load var functie
function loadValue(name, default_val) {
    var value;
    if (GM) {
        value = GM_getValue(name, default_val);
    } else {
        value = localStorage.getItem(name) || default_val;
        saveValue(name, default_val);
    }
    return value;
}

// GM save var functie
function saveValue(name, val) {
    setTimeout(function () {
        GM_setValue(name, val);
    }, 0);
};

// GM delete var functie
function deleteValue(name) {
    setTimeout(function () {
        GM_deleteValue(name);
    }, 0);
};

// Instellingen icoon (gods area)
function instellingen_icoon() {
    if (!$("#og_instellingen_icoon").get(0)) {
        var a = document.createElement('div');
        a.id = "og_instellingen_icoon";
        a.className = 'btn_settings circle_button'; // Grepo style
        var img = document.createElement('div');
        img.style.margin = '6px 0px 0px 5px';
        img.style.background = "url(https://www.grepotools.nl/ocean_grid/afbeeldingen/ocean_grid_setup_icon.png) no-repeat 0px 0px";
        img.style.width = '22px';
        img.style.height = '22px';
        img.style.backgroundSize = '100%';
        a.style.top = '180px';
        a.style.right = '0px';
        a.style.zIndex = '100';
        a.appendChild(img);
        document.getElementById('ui_box').appendChild(a);

        $( "#og_instellingen_icoon" )
            .mouseover(function() {
            toon_instellingen_tooltip();
        })
            .mouseout(function() {
            verberg_instellingen_tooltip();
        })
            .click(function() {
            og_menu_zichtbaar=1;
            open_instellingen_venster();
        });

    }
}

// Instellingen icoon (gods area) - tooltip tonen
function toon_instellingen_tooltip(){
    $('#popup_div').css('left', (event.clientX-180)+"px");
    $('#popup_div').css('top', (event.clientY+15)+"px");
    $('#popup_div').css('display', 'block');
    $('#popup_div').css('opacity', '1');
    $('#popup_content').html("<div>GrepoTools.nl | Ocean Grid<br>"+vertaling[grepo_taal].versie+": "+og_versie+"<br>"+vertaling[grepo_taal].instellingen+"</div>");
}

// Instellingen icoon (gods area) - tooltip verbergen
function verberg_instellingen_tooltip(){
    $('#popup_div').css('display', 'none');
    $('#popup_div').css('opacity', '0');
    $('#popup_content').html('<div></div>');
}

// Ocean grid - id aanmaken (moet ivm wisselen kaart) en bepalen of deze zichtbaar moet zijn
function grid_id() {
     if (!$("#og_kaart_oceangrid").get(0)) {
        //Raster ID niet aanwezig. Id aanmaken en grid tekenen
        if (document.querySelectorAll('#minimap_canvas.expanded').length > 0) { // '#minimap_canvas.expanded = strategische kaart
            $("<div id='og_kaart_oceangrid'></div>").insertAfter('#minimap_islands_layer');
            grid_tekenen();
        }
    }

    //Bepalen of raster zichtbaar of onzichtbaar moet zijn.
    if (og_raster_zichtbaar==1){
        $("#og_kaart_oceangrid").css('opacity', '1');
        $('#og_instelling_grid_zichtbaar').addClass("checked"); // Instellingen menu
    } else {
        $("#og_kaart_oceangrid").css('opacity', '0');
        $('#og_instelling_grid_zichtbaar').removeClass("checked"); // Instellingen menu
    }
}

// Ocean grid - tekenen (bij start en na een aanpassing)
function grid_tekenen (){
    var grid_html="";
    og_raster_stap = og_oceaan_afmeting / og_aantal_rasters;
    $('#og_kaart_oceangrid').html('');

    // Grid
    for(var grepo_oceaan_loop=0; grepo_oceaan_loop < og_raster_oc.length; ++grepo_oceaan_loop){
        var og_raster_oc_x = (Math.floor(og_raster_oc[grepo_oceaan_loop]/10))*og_oceaan_afmeting;
        var og_raster_oc_y = (og_raster_oc[grepo_oceaan_loop]%10)*og_oceaan_afmeting;

        for (let x = 0; x < og_aantal_rasters-1; x++) {
            grid_html+="<div class='og_border_right' style='width: "+og_raster_stap+"px; height: "+og_oceaan_afmeting+"px; left:"+(og_raster_oc_x+(x*og_raster_stap))+"px; top:"+og_raster_oc_y+"px;'></div>";
        }

        for (let y = 0; y < og_aantal_rasters-1; y++) {
            grid_html+="<div class='og_border_bottom' style='width: "+og_oceaan_afmeting+"px; height: "+og_raster_stap+"px; left:"+og_raster_oc_x+"px; top:"+(og_raster_oc_y+(y*og_raster_stap))+"px;'></div>";
        }
        // Border om de oceaan
        grid_html+="<div class='og_border' style='width: "+(og_oceaan_afmeting-3)+"px; height: "+(og_oceaan_afmeting-3)+"px; left:"+og_raster_oc_x+"px; top:"+og_raster_oc_y+"px;'></div>";

        // Grid tekst
        var i=0;
        for (let x = 0; x < og_aantal_rasters; x++) {
            for (let y = 0; y < og_aantal_rasters; y++) {
                grid_html+="<div class='og_text' style='left:" + (10+(og_raster_oc_x+(x*og_raster_stap))) + "px;top:" + (10+(og_raster_oc_y+(y*og_raster_stap))) + "px;'>"+ og_raster_oc[grepo_oceaan_loop] + " " + og_raster_letters[x]+(y+1)+ "</div>";
                i++;
            }
        }
    }

    $('#og_kaart_oceangrid').html(grid_html);
    // Kleur tekst
    $(".og_text").css("color", og_raster_kleur_tekst);
    // kleur raster
    $(".og_border_right").css("border-right-color", og_raster_kleur);
    $(".og_border_bottom").css("border-bottom-color", og_raster_kleur);
    $(".og_border").css("border-color", og_raster_kleur);
}

// Met timer
function loop_instellingen_venster (){
    maak_instellingen_venster();

    // Is het instellingen menu venster zichtbaar? Nee, dan reset ocean grid zichtbaarheid
    if (!uw.GPWindowMgr.getOpenFirst(uw.Layout.wnd.TYPE_PLAYER_SETTINGS)) {
        og_menu_zichtbaar=0;
    }

    // Welk menu is actief
    if (og_menu_zichtbaar==0){
        $('#og_menu_links').removeClass("selected");
        $("#og_menu_rechts").css('display', 'none');
    } else {
        $('a', $('.settings-menu')).each(function () {
            ($(this)).removeClass("selected"); //
        });
        $('.section', $('.settings-container')).each(function () {
            ($(this)).css('display', 'none'); //
        });

        $('#og_menu_links').addClass("selected");
        $("#og_menu_rechts").css('display', 'block');
    }
}

// Open het instellingen venster (Door klikken op instellingen icoon)
function open_instellingen_venster() {
    if (!uw.GPWindowMgr.getOpenFirst(uw.Layout.wnd.TYPE_PLAYER_SETTINGS)) {
        og_menu_zichtbaar=1;
    }

    uw.Layout.wnd.Create(uw.GPWindowMgr.TYPE_PLAYER_SETTINGS, vertaling[grepo_taal].instellingen);
}

function maak_raster_grootte_opties(){
    var i=0;
    var og_raster_dropdown_opties = [];

    for(i=og_raster_grootte.min; i<=og_raster_grootte.max; i++){
        og_raster_dropdown_opties.push({
            value: i,
            name: i+' x '+i
        })
    }
    return og_raster_dropdown_opties;
}

function maak_kleuren_opties(){
    var i=0;
    var og_kleuren_dropdown_opties = [];
    var kleuren ={wit:"#FFF", grijs:"#969696",zwart:"#000",rood:"#F00",bruin:"#BB5511",blauw:"#09F",paars:"#F0F",groen:"#399B1E",geel:"#FF0"};

    for (var key in kleuren) {
         og_kleuren_dropdown_opties.push({
            value: kleuren[key],
            name: vertaling[grepo_taal].og_instelling_kleuren[key]
        })
    }
    return og_kleuren_dropdown_opties;
}

function maak_instellingen_venster() {

    // Menu links
    if (!$("#og_menu_links").get(0)) {
        $(".settings-menu ul:last").append('<li id="og_menu_li"><img style="margin-top: 0px;height:15px;vertical-align: middle;"; id="og_menu_icon" src="https://www.grepotools.nl/ocean_grid/grepo_ocean_grid_setup_icon.png" ></div><a id="og_menu_links">Ocean Grid - Instellingen</a></li>');
    }

    // Geklikt op ander menu
    $(".settings-link").click(function () {
        og_menu_zichtbaar=0;
    })
    // extra check voor mensen die dio script gebruiken. dio gebruikt een andere structuur
    $("#dio_tools").click(function () {
        og_menu_zichtbaar=0;
    })

    // Geklikt op ocean grid menu
    $("#og_menu_links").click(function () {
        og_menu_zichtbaar=1;
    })

    if (!$("#og_menu_rechts").get(0)) {
        $('.settings-container')
            .append(
            $('<div/>', {'id':'og_menu_rechts', 'class':'player_settings section'})
            .append($('<div/>', {'id':'og_menu_achtergrond'}))
            .append($('<div/>', {'class':'game_header bold'}).text('Ocean Grid | '+vertaling[grepo_taal].instellingen))
            .append($('<div/>', {'class':'group'})
                    // Instelling grid aan/uit zetten
                    .append($('<div/>', {'id':'og_instelling_grid_zichtbaar', 'class':'checkbox_new'})
                            .append($('<div/>', {'class':'cbx_icon'}))
                            .append($('<div/>', {'class':'cbx_caption'}).text(vertaling[grepo_taal].og_instelling_grid_zichtbaar))
                           )
                    .append($('<br>'))
                    // Instelling grid rasters [2 x 2 tot 10 x 10]
                    .append($('<label/>', {'for': 'og_instelling_grid_verdeling'}).text(vertaling[grepo_taal].og_instelling_grid_verdeling))
                    .append($('<div/>', {'id':'og_instelling_grid_verdeling', 'class':'dropdown default'})
                            .dropdown({
                                  list_pos : 'left',
                                  value: og_aantal_rasters,
                                  options: maak_raster_grootte_opties()
                                  })
                           )
                    .append($('<br>'))
                    // Instelling grid tekstkleur
                    .append($('<label/>', {'for': 'og_instelling_grid_tekst_kleur'}).text(vertaling[grepo_taal].og_instelling_grid_tekst_kleur))
                    .append($('<div/>', {'id':'og_instelling_grid_tekst_kleur', 'class':'dropdown default'})
                            .dropdown({
                                  list_pos : 'left',
                                  value: og_raster_kleur_tekst,
                                  options: maak_kleuren_opties()
                                  })
                           )
                    .append($('<br>'))
                    // Instelling grid tekstkleur
                    .append($('<label/>', {'for': 'og_instelling_grid_kleur'}).text(vertaling[grepo_taal].og_instelling_grid_kleur))
                    .append($('<div/>', {'id':'og_instelling_grid_kleur', 'class':'dropdown default'})
                             .dropdown({
                                   list_pos : 'left',
                                   value: og_raster_kleur,
                                   options: maak_kleuren_opties()
                                   })
                           )
                    .append($('<br><br>'))
                    // Instelling oceanen waar het grid getoond moet worden
                    .append($('<label/>', {'for': 'og_instelling_grid_oceanen'}).text(vertaling[grepo_taal].og_instelling_grid_oceanen))
                    .append($('<br>'))
                    .append($('<label/>', {'for': 'og_instelling_grid_oceanen'}).text(vertaling[grepo_taal].og_instelling_grid_oceanen_voorbeeld))
                    .append($('<textarea/>',{'id':'og_instelling_grid_oceanen','style':'width: 360px; min-height: 100px;'}).val(og_raster_oc))
                    // Script informatie
                    .append("<div class='og_info'>Grepolis Ocean Grid: | "+vertaling[grepo_taal].versie+': '+og_versie+" | "+vertaling[grepo_taal].wereld+": "+grepo_world_data+" | "+vertaling[grepo_taal].taal+": "+grepo_taal+"<br><a id='og_link_website' href='https://www.grepotools.nl' target='_blank'>GrepoTools.nl</a> | 2022 - "+og_datum.getFullYear()+' | Marcel-Z </div>')
                   )
        )

        // verwerk grid aan/uit
        $("#og_instelling_grid_zichtbaar").click(function(){
            if ($('#og_instelling_grid_zichtbaar').hasClass("checked")){
                $('#og_instelling_grid_zichtbaar').removeClass("checked");
                og_raster_zichtbaar = 0;
            } else {
                $('#og_instelling_grid_zichtbaar').addClass("checked");
                og_raster_zichtbaar = 1;
            }
            safe_instellingen ();
        });

        // verwerk grid
        $("#og_instelling_grid_verdeling_list").click(function(){
            $('.selected', $('#og_instelling_grid_verdeling_list')).each(function () {
                if (og_temp_waarde_instelling_select_01 != $(this).attr( "name" )){
                    og_temp_waarde_instelling_select_01 = $(this).attr( "name" );
                    og_aantal_rasters = $(this).attr( "name" );
                    safe_instellingen ();
                    grid_tekenen ();
                };
            });
        });

        // verwerk oceanen
        $("#og_instelling_grid_oceanen").focusout(function(){
            og_raster_oc.length = 0;
            og_raster_oc = $("#og_instelling_grid_oceanen").val().split(",");
            safe_instellingen ();
            grid_tekenen ();
        });

        // verwerk kleuren grid tekst
        $("#og_instelling_grid_tekst_kleur_list").click(function(){
            $('.selected', $('#og_instelling_grid_tekst_kleur_list')).each(function () {
                if (og_temp_waarde_instelling_select_02 != $(this).attr( "name" )){
                    og_temp_waarde_instelling_select_02 = $(this).attr( "name" );
                    og_raster_kleur_tekst = $(this).attr( "name" );
                    safe_instellingen ();
                    grid_tekenen ();
                };
            });
        });

        // verwerk kleuren grid
        $("#og_instelling_grid_kleur_list").click(function(){
            $('.selected', $('#og_instelling_grid_kleur_list')).each(function () {
                if (og_temp_waarde_instelling_select_03 != $(this).attr( "name" )){
                    og_temp_waarde_instelling_select_03 = $(this).attr( "name" );
                    og_raster_kleur = $(this).attr( "name" );
                    safe_instellingen ();
                    grid_tekenen ();
                };
            });
        });
    }
}