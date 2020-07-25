// stale
const xsrodek = 250;
const ysrodek = 250;
const rtarcza = 245;
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


// zwraca aktualny czas jako string postaci "HH:MM:SS"
function podajAktCzas() {
    let x = new Date();
    x = x.toTimeString();
    // miedzy slashami regex, usuwa wszystko po 1 spacji
    return x.replace(/ .*/, "");
}

// hhmmss - string postaci HH:MM:SS
function wypiszCzas(hhmmss=podajAktCzas()) {
    
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    ctx1.font = wielkCzcionki + "px " + rodzCzcionki;
    ctx1.textAlign = "center";
    ctx1.textBaseline = "middle";
    /* text umieszczamy mniej wiecej w polowie canvasa w pionie i poziomie */
    ctx1.fillText(hhmmss, canvas1.width / 2, canvas1.height / 2);
}

// do wyw. funkcji co jakis czas (w ms) uzywa sie setInterval()
setInterval(wypiszCzas, 1000);


///////////////////////////////////////////////////////////////////////////////
//                              zegar analogowy                              //
///////////////////////////////////////////////////////////////////////////////
let canvas2 = document.getElementById("myCanvas2");
let ctx2 = canvas2.getContext("2d");

function stDoRad(stopnie) {
    // 1 rad = 180st/pi = 57.296st
    let radiany = stopnie / (180 / Math.PI);
    return radiany;
}

function rysujTarczeZegara() {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx2.beginPath();
    ctx2.strokeStyle = "black";
    ctx2.lineWidth = 5;
    // ctx2.arc(x, y, r, sAngle, eAngle, [countercolockwise]);
    // x,y - center; r - promien
    // [s|e]Angle - kat pocz/konc w rad, 0 - to 3 godzina
    ctx2.arc(xsrodek, ysrodek, rtarcza, 0, stDoRad(360));
    ctx2.stroke();

    // tarcza ma 12 cyfr 1-12
    let xCyfra = canvas2.width / 2; // dla cyfry 12
    let yCyfra = wielkCzcionki; // dla cyfry 12
    let katCyfra = 360; // dla cyfry 12
    ctx2.font = wielkCzcionki + "px " + rodzCzcionki;
    ctx2.textAlign = "center";
    ctx2.textBaseline = "middle";
    for (let i = 12; i > 0; i--) {
        ctx2.beginPath();
        /* text umieszczamy mniej wiecej w polowie canvasa w pionie i poziomie */
        ctx2.fillText(i, xCyfra, yCyfra);
        katCyfra -= 360/12;
        // wypakowywanie troche w stylu pythonowskim
        [xCyfra, yCyfra] = przesunXY(katCyfra);
    }
    
    // rysowanie wskazowki godzinowej
    rysWskaz(zwrocGodz1do12(), dlWskazGodz, "black", grubWskGodz);
    rysWskaz(zwrocMin1do12(), dlWskazMin, "blue", grubWskMin);
    rysWskaz(zwrocSek1do12(), dlWskazSek, "red", grubWskSek);

}

// przesuwa wsp XY na tarczy obwodzie zegara o dany kat (w deg)
// a konkretnie zwraca przesuniete wspolrzedne (tablica 2 element z intami)
function przesunXY(kat, r=rtarcza-wielkCzcionki) {
    // za:
    // https://math.stackexchange.com/questions/260096/find-the-coordinates-of-a-point-on-a-circle
    let nowyX = r * Math.sin(stDoRad(kat));
    let nowyY = r * Math.cos(stDoRad(kat));
    // tu zalozenie, ze srodek ukladu jest w punkcie (0, 0)
    // u nas jest to: (canvas2.width/2,  canvas2.height/2)
    // a wiec korygujemy wspolrzedne
    nowyX = nowyX + canvas2.width/2;
    nowyY = canvas2.height/2 - nowyY;

    // zwracamy tablice z wartosciami zaokraglonymi do pelnych pixeli
    return [Math.round(nowyX, 0), Math.round(nowyY, 0)];
}

// zwraca godziny (Int-a)
// jako cyfre od 1 do 12
function zwrocGodz1do12() {
    let strCzas = podajAktCzas();
    let godz = strCzas.replace(/([0-9]{2}):([0-9]{2}):([0-9]{2})/, "$1");
    if(godz > 12) {godz -= 12;}
    return parseInt(godz);
}

// zwraca minuty (Floata)
// jako cyfre z zakresu 1-12 (bedzie latwiejsza zamiana na kat pozniej)
function zwrocMin1do12() {
    let strCzas = podajAktCzas();
    let min = strCzas.replace(/([0-9]{2}):([0-9]{2}):([0-9]{2})/, "$2");
    min = parseInt(min);
    // 12 --- 60
    // x  --- min
    min = min * 12 / 60;

    return min;
}

// zwraca sekundy (Floata)
// jako cyfre z zakresu 1-12 (bedzie latwiejsza zamiana na kat pozniej)
function zwrocSek1do12() {
    let strCzas = podajAktCzas();
    let sek = strCzas.replace(/([0-9]{2}):([0-9]{2}):([0-9]{2})/, "$3");
    sek = parseInt(sek);
    // 12 --- 60
    // x  --- sek
    sek = sek * 12 / 60;

    return sek;
}


// przyjmuje cyfre: {godz|min|sek} zakres 1 do 12
// zwraca kat (deg) 0-360, a wiec kat gdzie ta cyfra lezy
function czasDoKata(cyfra) {
    // 360 --- 24
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
    ctx2.moveTo(xsrodek, ysrodek);
    // pozycja konca wskazowki
    let konWskazowki = przesunXY(czasDoKata(czas), dlugosc);
    ctx2.lineTo(...konWskazowki);
    ctx2.stroke();
}


// do wyw. funkcji co jakis czas (w ms) uzywa sie setInterval()
// rysujTarczeZegara();
setInterval(rysujTarczeZegara, 1000);
