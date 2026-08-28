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
    renderSeatMap(document.getElementById(`seat${period}`), seat, venue);

    sessionCard.classList.toggle('representative-session', isRepresentativeSession);
    sessionCard.classList.toggle('third-grade-representative', isThirdGradeRepresentative);
    document.getElementById(`special${period}`).classList.toggle('hidden', !isRepresentativeSession);
    document.getElementById(`freeSeat${period}`).innerText = isThirdGradeRepresentative ? '前方代表者席' : '自由座席';
}

function renderSeatMap(container, selectedSeat, venue) {
    const seatOrder = [1, 2, 5, 6, 3, 4];
    const selected = String(selectedSeat).trim();

    container.replaceChildren();
    container.setAttribute('aria-label', `テーブル指定席 ${selected}`);
    container.classList.toggle('hex-seat-map', venue.trim() === 'CoTan C2');
    container.classList.toggle('round-seat-map', venue.trim() === 'CoTan C1');

    if (venue.trim() === 'CoTan C2') {
        renderHexSeatMap(container, selected);
        return;
    }

    if (venue.trim() === 'CoTan C1') {
        renderRoundSeatMap(container, selected);
        return;
    }

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

function renderHexSeatMap(container, selectedSeat) {
    const svgNamespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNamespace, 'svg');
    const seats = [
        { number: 1, points: '1,25 50,1 50,50', starX: 34, starY: 26 },
        { number: 2, points: '50,1 99,25 50,50', starX: 66, starY: 26 },
        { number: 6, points: '99,25 99,75 50,50', starX: 82, starY: 50 },
        { number: 4, points: '99,75 50,99 50,50', starX: 66, starY: 74 },
        { number: 3, points: '50,99 1,75 50,50', starX: 34, starY: 74 },
        { number: 5, points: '1,75 1,25 50,50', starX: 18, starY: 50 }
    ];

    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('class', 'hex-seat-svg');
    svg.setAttribute('aria-hidden', 'true');

    seats.forEach(seat => {
        const section = document.createElementNS(svgNamespace, 'polygon');
        const isSelected = String(seat.number) === selectedSeat;
        section.setAttribute('points', seat.points);
        section.setAttribute('class', `hex-seat-section${isSelected ? ' selected' : ''}`);
        svg.appendChild(section);

        if (isSelected) {
            const star = document.createElementNS(svgNamespace, 'text');
            star.setAttribute('x', seat.starX);
            star.setAttribute('y', seat.starY);
            star.setAttribute('class', 'hex-seat-star');
            star.textContent = '★';
            svg.appendChild(star);
        }
    });

    container.appendChild(svg);
}

function renderRoundSeatMap(container, selectedSeat) {
    const svgNamespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNamespace, 'svg');
    const seats = [
        { number: 1, x: 42, y: 18 },
        { number: 2, x: 78, y: 18 },
        { number: 5, x: 18, y: 45 },
        { number: 6, x: 102, y: 45 },
        { number: 3, x: 42, y: 72 },
        { number: 4, x: 78, y: 72 }
    ];

    svg.setAttribute('viewBox', '0 0 120 90');
    svg.setAttribute('class', 'round-seat-svg');
    svg.setAttribute('aria-hidden', 'true');

    const table = document.createElementNS(svgNamespace, 'rect');
    table.setAttribute('x', '22');
    table.setAttribute('y', '18');
    table.setAttribute('width', '76');
    table.setAttribute('height', '54');
    table.setAttribute('class', 'round-table');
    svg.appendChild(table);

    const divider = document.createElementNS(svgNamespace, 'line');
    divider.setAttribute('x1', '60');
    divider.setAttribute('y1', '18');
    divider.setAttribute('x2', '60');
    divider.setAttribute('y2', '72');
    divider.setAttribute('class', 'round-table-divider');
    svg.appendChild(divider);

    seats.forEach(seat => {
        const circle = document.createElementNS(svgNamespace, 'circle');
        const isSelected = String(seat.number) === selectedSeat;
        circle.setAttribute('cx', seat.x);
        circle.setAttribute('cy', seat.y);
        circle.setAttribute('r', '16');
        circle.setAttribute('class', `round-seat${isSelected ? ' selected' : ''}`);
        svg.appendChild(circle);

        if (isSelected) {
            const star = document.createElementNS(svgNamespace, 'text');
            star.setAttribute('x', seat.x);
            star.setAttribute('y', seat.y);
            star.setAttribute('class', 'round-seat-star');
            star.textContent = '★';
            svg.appendChild(star);
        }
    });

    container.appendChild(svg);
}
