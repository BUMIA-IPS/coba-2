// Variabel dengan nama unik untuk menghindari error 'Already Declared'
var RACE_SHEET_ID = "1hpWKGV0q74t77vxGrHAujag-i2OTquEi_0U4eOcsPKM";
var RACE_DATA_URL = "https://docs.google.com/spreadsheets/d/" + RACE_SHEET_ID + "/gviz/tq?tqx=out:json";

var raceQuestions = [];
var racePositions = [1, 1, 1, 1]; 
var raceIndexSoal = [0, 0, 0, 0]; 
var isRaceActive = false;

async function initGame() {
    try {
        const response = await fetch(RACE_DATA_URL);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        
        raceQuestions = json.table.rows.map(r => ({
            q: r.c[0] ? String(r.c[0].v) : "Soal...",
            a: r.c[1] ? String(r.c[1].v) : "-",
            b: r.c[2] ? String(r.c[2].v) : "-",
            c: r.c[3] ? String(r.c[3].v) : "-",
            k: r.c[4] ? String(r.c[4].v).toUpperCase().trim() : "A"
        }));

        if (raceQuestions.length > 0) {
            isRaceActive = true;
            document.getElementById('start-btn').style.display = 'none';
            for(let i=1; i<=4; i++) updateTampilanSoal(i);
        }
    } catch(err) {
        alert("Gagal memuat soal! Pastikan Google Sheet sudah di-Publish ke Web.");
        console.error(err);
    }
}

function updateTampilanSoal(pNum) {
    const data = raceQuestions[raceIndexSoal[pNum-1]];
    if (!data) return;

    document.getElementById("q" + pNum).innerText = data.q;
    const areaTombol = document.getElementById("opt" + pNum);
    areaTombol.innerHTML = ''; 
    
    ['A', 'B', 'C'].forEach(label => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerText = label + ". " + data[label.toLowerCase()];
        // Teknik Closure agar nomor pemain terkunci dengan benar
        btn.onclick = (function(p, l) {
            return function() { prosesJawaban(p, l); };
        })(pNum, label);
        areaTombol.appendChild(btn);
    });
}

function prosesJawaban(pNum, pilihan) {
    if(!isRaceActive) return;
    
    const jawabanBenar = raceQuestions[raceIndexSoal[pNum-1]].k;
    const bebek = document.getElementById("d" + pNum);

    if (pilihan === jawabanBenar) {
        // Suara Quack
        const sOk = document.getElementById('snd-ok');
        if(sOk) { sOk.currentTime = 0; sOk.play().catch(()=>{}); }
        
        // Maju 8%
        racePositions[pNum-1] += 8; 
        bebek.style.left = racePositions[pNum-1] + "%";
        
        if (racePositions[pNum-1] >= 85) {
            isRaceActive = false;
            const popup = document.getElementById('win-notif');
            popup.innerText = "BEBEK " + pNum + " MENANG! 🏆";
            popup.style.display = 'block';
        }
    } else {
        // Suara Salah
        const sNo = document.getElementById('snd-no');
        if(sNo) { sNo.currentTime = 0; sNo.play().catch(()=>{}); }
        
        // Mundur 3%
        racePositions[pNum-1] = Math.max(1, racePositions[pNum-1] - 3);
        bebek.style.left = racePositions[pNum-1] + "%";
    }

    // Ganti ke soal berikutnya untuk pemain tersebut
    raceIndexSoal[pNum-1] = (raceIndexSoal[pNum-1] + 1) % raceQuestions.length;
    updateTampilanSoal(pNum);
}