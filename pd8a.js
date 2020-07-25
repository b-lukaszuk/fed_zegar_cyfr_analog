///////////////////////////////////////////////////////////////////////////////
//                                   stale                                   //
///////////////////////////////////////////////////////////////////////////////
const xSrodek = 250; // wsp X dla srodka tarczy zegara (w canvas2)
const ySrodek = 250; // wsp Y dla srodka tarczy zegara (w canvas2)
const rTarcza = 245; // promien tarczy zegara
const wielkCzcionki = 30;
const rodzCzcionki = "Arial";
const dlWskazGodz = 100;
const dlWskazMin = 150;
const dlWskazSek = 200;
const grubWskGodz = 15;
const grubWskMin = 10;
const grubWskSek = 5;

///////////////////////////////////////////////////////////////////////////////
//                               zegar cyfrowy                               //
///////////////////////////////////////////////////////////////////////////////
let canvas1 = document.getElementById("myCanvas1");
let ctx1 = canvas1.getContext("2d");


// zwraca aktualny czas => Str ("HH:MM:SS")
function zwrocAktCzas() {
    let x = new Date();
    x = x.toTimeString();
    // miedzy slashami regex, usuwa wszystko po 1 spacji
    // prosty regex przetestowany w: https://regex101.com/
    return x.replace(/ .*/, "");
}

// wypisuje aktualny czas do canvasa1
// hhmmss: Str ("HH:MM:SS")
function wypiszCzas(hhmmss=zwrocAktCzas()) {
    
    // f wywolywana co 1 sek, wiec za kazdym razem czyscimy canvas
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    ctx1.font = wielkCzcionki + "px " + rodzCzcionki;
    ctx1.textAlign = "center";
    ctx1.textBaseline = "middle";
    /* text umieszczamy w polowie canvasa w pionie i poziomie */
    ctx1.fillText(hhmmss, canvas1.width / 2, canvas1.height / 2);
}

// do wyw. funkcji co jakis czas (w ms) uzywa sie setInterval()
setInterval(wypiszCzas, 1000);


///////////////////////////////////////////////////////////////////////////////
//                              zegar analogowy                              //
///////////////////////////////////////////////////////////////////////////////
let canvas2 = document.getElementById("myCanvas2");
let ctx2 = canvas2.getContext("2d");

// stopnie: Float (0-360)
// zwraca radiany: Float (0-360)
function stDoRad(stopnie) {
    // 1 rad = 180st/pi = 57.296st
    let radiany = stopnie / (180 / Math.PI);
    return radiany;
}

function rysujTarczeZegara() {
    // funkcja bedzie wywolywana co 1 sek, wiec za kazdym razem czyscimy canvas
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx2.beginPath();
    ctx2.strokeStyle = "black";
    ctx2.lineWidth = 5;
    // ctx2.arc(x, y, r, sAngle, eAngle, [countercolockwise]);
    // x,y - center; r - promien
    // [s|e]Angle - kat pocz/konc w rad, 0 - to 3 godzina
    ctx2.arc(xSrodek, ySrodek, rTarcza, 0, stDoRad(360));
    ctx2.stroke();

    // tarcza ma 12 cyfr 1-12
    let xCyfra = 0; // inicjalizacja 0
    let yCyfra = 0; // inicjalizacja 0
    let katCyfra = 0; // inicjalizacja 0
    ctx2.font = wielkCzcionki + "px " + rodzCzcionki;
    ctx2.textAlign = "center";
    ctx2.textBaseline = "middle";
    // wypisujemy cyfry od 12 do 1 (counter-clock-wise)
    for (let i = 12; i > 0; i--) {
        katCyfra = czasDoKata(i);
        // wypakowywanie troche w stylu pythonowskim
        [xCyfra, yCyfra] = przesunXY(katCyfra);
        /* text umieszczamy mniej wiecej w polowie canvasa w pionie i poziomie */
        ctx2.fillText(i, xCyfra, yCyfra);
    }
}

function rysujZegar() {
    // rysowanie tarczy
    rysujTarczeZegara();

    // rysowanie wskazowek
    rysWskaz(zwrocGodz1do12(), dlWskazGodz, "black", grubWskGodz);
    rysWskaz(zwrocMin1do12(), dlWskazMin, "blue", grubWskMin);
    rysWskaz(zwrocSek1do12(), dlWskazSek, "red", grubWskSek);
}


// przesuwa wsp XY na tarczy obwodzie zegara o dany kat
// a konkretnie zwraca przesuniete wspolrzedne XY
// kat: Float (0-360) w stopniach
// r: Float, promien okregu
// zwraca [Int, Int], nowe wsp XY dla punktu na okregu
function przesunXY(kat, r=rTarcza-wielkCzcionki) {
    // za:
    // https://math.stackexchange.com/questions/260096/find-the-coordinates-of-a-point-on-a-circle
    let nowyX = r * Math.sin(stDoRad(kat));
    let nowyY = r * Math.cos(stDoRad(kat));
    // tu (na stronce cytowanej wyzej) zalozenie, ze srodek ukladu jest w punkcie (0, 0)
    // u nas jest to: (xSrodek,  ySrodek)
    // a wiec korygujemy wspolrzedne
    nowyX = nowyX + xSrodek;
    nowyY = ySrodek - nowyY;

    // zwracamy tablice z wartosciami zaokraglonymi do pelnych pixeli
    return [Math.round(nowyX, 0), Math.round(nowyY, 0)];
}

// zwraca: Int (1-12), aktualna godzina
function zwrocGodz1do12() {
    let strCzas = zwrocAktCzas();
    // prosty regex przetestowany w: https://regex101.com/
    let godz = strCzas.replace(/([0-9]{2}):([0-9]{2}):([0-9]{2})/, "$1");
    if(godz > 12) {godz -= 12;}
    return parseInt(godz);
}

// zwraca: Float (1-12), aktualna ilosc minut
// minuty reprezentowane sa jako cyfra z zakresu 1-12,
// bo tego wymaga funkcja czasdoKata()
function zwrocMin1do12() {
    let strCzas = zwrocAktCzas();
    // prosty regex przetestowany w: https://regex101.com/
    let min = strCzas.replace(/([0-9]{2}):([0-9]{2}):([0-9]{2})/, "$2");
    min = parseInt(min);
    // 12 --- 60
    // x  --- min
    min = min * 12 / 60;

    return min;
}

// zwraca: Float (1-12), aktualna ilosc sekund
// aktualne sekundy reprezentowane sa jako cyfra z zakresu 1-12,
// bo tego wymaga funkcja czasdoKata()
function zwrocSek1do12() {
    let strCzas = zwrocAktCzas();
    // prosty regex przetestowany w: https://regex101.com/
    let sek = strCzas.replace(/([0-9]{2}):([0-9]{2}):([0-9]{2})/, "$3");
    sek = parseInt(sek);
    // 12 --- 60
    // x  --- sek
    sek = sek * 12 / 60;

    return sek;
}

// cyfra: {Int|Float} (1 do 12) oznaczajacy {godz|min|sek} 
// zwraca: Float, czyli kat (deg) 0-360, 
// a wiec kat pod jakim ta cyfra lezy na tarczy zegara
function czasDoKata(cyfra) {
    // 360 --- 12
    // x   --- cyfra
    let kat = 0;
    kat = cyfra * 360 / 12;

    return kat;
}

// czas: {Int|Float} od 1 do 12
// dlugosc: Int, dlugosc wskazowki w px
// kolor: Str, kolor wskazowki
// grubosc: Int, grubosc linii wskazowki
function rysWskaz(czas, dlugosc, kolor="red", grubosc) {
    ctx2.beginPath();
    ctx2.strokeStyle = kolor;
    ctx2.lineWidth = grubosc;
    ctx2.moveTo(xSrodek, ySrodek);
    // pozycja konca wskazowki [Int, Int]
    let konWskazowki = przesunXY(czasDoKata(czas), dlugosc);
    ctx2.lineTo(...konWskazowki);
    ctx2.stroke();
}

// do wyw. funkcji co jakis czas (w ms) uzywa sie setInterval()
setInterval(rysujZegar, 1000);
