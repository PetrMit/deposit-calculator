let depositCount = 0;

function addDeposit() {
    depositCount++;

    const depositsContainer = document.getElementById('depositsContainer');

    const depositDiv = document.createElement('div');
    depositDiv.className = 'deposit';
    depositDiv.id = `deposit${depositCount}`;

    depositDiv.innerHTML = `
        <h3>Вклад ${depositCount}</h3>
        <label for="amount${depositCount}">Сумма вклада (руб):</label>
        <input type="number" id="amount${depositCount}" name="amount${depositCount}" required>

        <label for="rate${depositCount}">Процентная ставка (% годовых):</label>
        <input type="number" id="rate${depositCount}" name="rate${depositCount}" step="0.01" required>

        <label for="term${depositCount}">Срок вклада (в месяцах):</label>
        <input type="number" id="term${depositCount}" name="term${depositCount}" required>

        <label for="capitalization${depositCount}">Период капитализации:</label>
        <select id="capitalization${depositCount}" name="capitalization${depositCount}">
            <option value="none">Без капитализации</option>
            <option value="monthly">Ежемесячно</option>
            <option value="daily">Ежедневно</option>
        </select>

        <button type="button" onclick="removeDeposit(${depositCount})">Удалить вклад</button>
        <hr>
    `;

    depositsContainer.appendChild(depositDiv);
}

function removeDeposit(id) {
    const depositDiv = document.getElementById(`deposit${id}`);
    depositDiv.parentNode.removeChild(depositDiv);
}

function calculate() {
    const totalIncomeElement = document.getElementById('totalIncome');
    const taxAmountElement = document.getElementById('taxAmount');

    let totalIncome = 0;
    let totalTax = 0;

    for (let i = 1; i <= depositCount; i++) {
        const amountElement = document.getElementById(`amount${i}`);
        if (!amountElement) continue; // Если вклад был удален

        const amount = parseFloat(amountElement.value);
        const rate = parseFloat(document.getElementById(`rate${i}`).value);
        const term = parseInt(document.getElementById(`term${i}`).value);
        const capitalization = document.getElementById(`capitalization${i}`).value;

        // Проверка корректности введенных данных
        if (isNaN(amount) || isNaN(rate) || isNaN(term)) {
            alert(`Пожалуйста, заполните все поля для вклада ${i} корректными значениями.`);
            return;
        }

        if (amount <= 0 || rate <= 0 || term <= 0) {
            alert(`Все значения для вклада ${i} должны быть положительными числами.`);
            return;
        }

        // Расчет дохода по вкладу с учетом капитализации
        let income = 0;
        const annualRate = rate / 100;

        if (capitalization === 'none') {
            // Без капитализации
            income = amount * annualRate * (term / 12);
        } else if (capitalization === 'monthly') {
            // Ежемесячная капитализация
            const periods = term;
            const monthlyRate = annualRate / 12;
            income = amount * (Math.pow(1 + monthlyRate, periods) - 1);
        } else if (capitalization === 'daily') {
            // Ежедневная капитализация
            const daysInYear = 365;
            const days = term * 30; // Приблизительное количество дней
            const dailyRate = annualRate / daysInYear;
            income = amount * (Math.pow(1 + dailyRate, days) - 1);
        }

        income = parseFloat(income.toFixed(2));
        totalIncome += income;

        // Расчет суммы налога
        const taxFreeRate = 0.01; // Не облагаемый налогом процент (ставка ЦБ)
        const taxRate = 13 / 100; // Ставка налога 13%
        const taxBase = Math.max(income - amount * (taxFreeRate * term / 12), 0);
        const taxAmount = taxBase * taxRate;
        totalTax += taxAmount;
    }

    totalIncome = totalIncome.toFixed(2);
    totalTax = totalTax.toFixed(2);

    // Вывод результатов
    totalIncomeElement.innerText = totalIncome;
    taxAmountElement.innerText = totalTax;

    document.getElementById('result').style.display = 'block';
}
let depositCount = 0;
let inflationData = [];

function loadInflationData() {
    // Ваш код для загрузки данных об инфляции, если это необходимо
}

function getKeyRate() {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const url = 'https://www.cbr.ru/scripts/xml_key.asp';

    fetch(proxyUrl + url)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');

            const keyRateNodes = xmlDoc.getElementsByTagName('KeyRate');
            const lastKeyRateNode = keyRateNodes[keyRateNodes.length - 1];

            const keyRateValue = lastKeyRateNode.getAttribute('CurRate');
            const keyRate = parseFloat(keyRateValue.replace(',', '.'));

            document.getElementById('keyRate').value = keyRate;
        })
        .catch(error => {
            console.error('Ошибка при получении ключевой ставки:', error);
            alert('Не удалось получить ключевую ставку. Пожалуйста, введите ее вручную.');
            document.getElementById('keyRate').removeAttribute('readonly');
        });
}

window.onload = function() {
    loadInflationData();
    getKeyRate();
};

// Ваши функции addDeposit, removeDeposit и calculate остаются без изменений или с вашими предыдущими дополнениями
