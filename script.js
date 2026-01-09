var FINAL_SHEET_ID = "1hpWKGV0q74t77vxGrHAujag-i2OTquEi_0U4eOcsPKM";
var FINAL_URL = "https://docs.google.com/spreadsheets/d/" + FINAL_SHEET_ID + "/gviz/tq?tqx=out:json";

var kuisData = [];
var posisiPemain = [1, 1, 1, 1];
var indeksSoalPemain = [0, 0, 0, 0];
var gameBerjalan = false;

async function initGame() {
    try {
        const response = await fetch(FINAL_URL);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        
        kuisData = json.table.rows.map(r => ({
            tanya: r.c[0] ? String(r.c[0].v) : "",
            a: r.c[1] ? String(r.c[1].v) : "",
            b: r.c[2] ? String(r.c[2].v) : "",
            c: r.c[3] ? String(r.c[3].v) : "",
            // Kolom E adalah r.c[4]
            kunci: r.c[4] ? String(r.c[4].v).toUpperCase().trim() : ""
        }));

        if (kuisData.length > 0) {
            gameBerjalan = true;
            document.getElementById('start-btn').style.display = 'none';
            for(let i=1; i<=4; i++) muatSoal(i);
        }
    } catch (e) {
        alert("Gagal memuat soal! Pastikan Google Sheet sudah 'Publish to Web'.");
    }
}

function muatSoal(p) {
    let soal = kuisData[indeksSoalPemain[p-1]];
    document.getElementById("q" + p).innerText = soal.tanya;
    let boxOpsi = document.getElementById("opt" + p);
    boxOpsi.innerHTML = "";

    ["A", "B", "C"].forEach(opsi => {
        let tombol = document.createElement("button");
        tombol.className = "opt-btn";
        tombol.innerText = opsi + ". " + soal[opsi.toLowerCase()];
        tombol.onclick = function() { verifikasiJawaban(p, opsi); };
        boxOpsi.appendChild(tombol);
    });
}

function verifikasiJawaban(p, jawaban) {
    if(!gameBerjalan) return;

    let benar = kuisData[indeksSoalPemain[p-1]].kunci;
    let elBebek = document.getElementById("d" + p);

    if (jawaban === benar) {
        // Suara Benar
        let sOk = document.getElementById('snd-ok');
        sOk.currentTime = 0;
        sOk.play().catch(()=>{});

        // Bebek Maju 8%
        posisiPemain[p-1] += 8;
        elBebek.style.left = posisiPemain[p-1] + "%";
        
        // Cek Menang
        if (posisiPemain[p-1] >= 85) {
            gameBerjalan = false;
            let win = document.getElementById('win-notif');
            win.innerText = "BEBEK " + p + " MENANG! 🏆";
            win.style.display = "block";
        }
    } else {
        // Suara Salah
        let sNo = document.getElementById('snd-no');
        sNo.currentTime = 0;
        sNo.play().catch(()=>{});

        // Mundur 3%
        posisiPemain[p-1] = Math.max(1, posisiPemain[p-1] - 3);
        elBebek.style.left = posisiPemain[p-1] + "%";
    }

    // Loop soal
    indeksSoalPemain[p-1] = (indeksSoalPemain[p-1] + 1) % kuisData.length;
    muatSoal(p);
}
