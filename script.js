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
            sessions: [1, 4, 7, 10].map(start => ({
                venue: cols[start],
                tableNo: cols[start + 1],
                seat: cols[start + 2]
            }))
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

    if (student && student.sessions[0].venue) {
        document.getElementById('currentStudent').innerText = `${grade}年${cls}組${num}番 表示中`;
        student.sessions.forEach((session, index) => {
            setSessionData(index + 1, session.venue, session.tableNo, session.seat, grade === '3');
        });
        
        document.getElementById('result').classList.remove('hidden');
        document.getElementById('error').classList.add('hidden');
    } else {
        document.getElementById('currentStudent').innerText = '';
        document.getElementById('result').classList.add('hidden');
        document.getElementById('error').classList.remove('hidden');
    }
}

function setSessionData(period, venue, tableNo, seat, isThirdGrade) {
    const isRepresentativeSession = venue.trim() === 'CoTan大教室';
    const isThirdGradeRepresentative = isRepresentativeSession && isThirdGrade;
    const sessionCard = document.getElementById(`session${period}`);

    document.getElementById(`v${period}`).innerText = venue;
    document.getElementById(`t${period}`).innerText = tableNo;
    renderSeatMap(document.getElementById(`seat${period}`), seat);

    sessionCard.classList.toggle('representative-session', isRepresentativeSession);
    sessionCard.classList.toggle('third-grade-representative', isThirdGradeRepresentative);
    document.getElementById(`special${period}`).classList.toggle('hidden', !isRepresentativeSession);
    document.getElementById(`freeSeat${period}`).innerText = isThirdGradeRepresentative ? '前方代表者席' : '自由座席';
}

function renderSeatMap(container, selectedSeat) {
    const seatOrder = [1, 2, 5, 6, 3, 4];
    const selected = String(selectedSeat).trim();

    container.replaceChildren();
    container.setAttribute('aria-label', `テーブル指定席 ${selected}`);

    seatOrder.forEach(seatNumber => {
        const seatCell = document.createElement('span');
        seatCell.className = 'seat-cell';

        if (String(seatNumber) === selected) {
            seatCell.innerText = '★';
            seatCell.classList.add('selected');
            seatCell.setAttribute('aria-current', 'true');
        }

        container.appendChild(seatCell);
    });
}
