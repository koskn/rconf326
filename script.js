let presentationData = [];

// ページ読み込み時にCSVを読み込み、保存された値を復元
window.onload = async () => {
    try {
        const response = await fetch('data.csv');
        const text = await response.text();
        presentationData = parseCSV(text);

        // 保存された値を復元
        if (localStorage.getItem('grade')) {
            document.getElementById('grade').value = localStorage.getItem('grade');
            document.getElementById('class').value = localStorage.getItem('class');
            document.getElementById('number').value = localStorage.getItem('number');
            search(); // 自動検索
        }
    } catch (e) {
        console.error("データの読み込みに失敗しました", e);
    }
};

function parseCSV(text) {
    const lines = text.trim().split('\n');
    return lines.slice(1).map(line => {
        const cols = line.split('\t'); // タブ区切りの場合。カンマなら ',' に変更
        return {
            no: cols[0],
            v12: cols[1], o12: cols[2], s12: cols[3],
            v34: cols[4], o34: cols[5], s34: cols[6]
        };
    });
}

function search() {
    const grade = document.getElementById('grade').value;
    const cls = document.getElementById('class').value;
    const num = document.getElementById('number').value.padStart(2, '0');
    const targetNo = `${grade}${cls}(${num})`;

    // 入力値を保存
    localStorage.setItem('grade', grade);
    localStorage.setItem('class', cls);
    localStorage.setItem('number', document.getElementById('number').value);

    const student = presentationData.find(d => d.no === targetNo);

    if (student && student.v12) {
        document.getElementById('v12').innerText = student.v12;
        document.getElementById('o12').innerText = student.o12 + "番目";
        document.getElementById('s12').innerText = "Spot " + student.s12;
        document.getElementById('v34').innerText = student.v34;
        document.getElementById('o34').innerText = student.o34 + "番目";
        document.getElementById('s34').innerText = "Spot " + student.s34;
        
        document.getElementById('result').classList.remove('hidden');
        document.getElementById('error').classList.add('hidden');
    } else {
        document.getElementById('result').classList.add('hidden');
        document.getElementById('error').classList.remove('hidden');
    }
}