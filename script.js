let depositCount = 0;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addDepositBtn').addEventListener('click', addDeposit);
    document.getElementById('calculateBtn').addEventListener('click', calculate);
});

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

        <label for="term${depositCount}">Срок вклада:</label>
        <input type="number" id="term${depositCount}" name="term${depositCount}" required>

        <label for="termType${depositCount}">Единица измерения срока:</label>
        <select id="termType${depositCount}" name="termType${depositCount}">
            <option value="months">Месяцы</option>
            <option value="days">Дни</option>
        </select>

        <label for="capitalization${depositCount}">Период капитализации:</label>
        <select id="capitalization${depositCount}" name="capitalization${depositCount}">
            <option value="none">Без капитализации</option>
            <option value="monthly">Ежемесячно</option>
            <option value="daily">Ежедневно</option>
        </select>

        <button type="button" class="removeDepositBtn" data-id="${depositCount}">Удалить вклад</button>
        <hr>
    `;

    depositsContainer.appendChild(depositDiv);

    // Добавляем обработчик события для кнопки удаления вклада
    depositDiv.querySelector('.removeDepositBtn').addEventListener('click', function() {
        removeDeposit(this.getAttribute('data-id'));
    });
}

function removeDeposit(id) {
    const depositDiv = document.getElementById(`deposit${id}`);
    if (depositDiv) {
        depositDiv.parentNode.removeChild(depositDiv);
    }
}

function calculate() {
    const totalIncomeElement = document.getElementById('totalIncome');
    const taxAmountElement = document.getElementById('taxAmount');

    let totalIncome = 0;
    let totalTax = 0;

    const keyRate = parseFloat(document.getElementById('keyRate').value) / 100;

    if (isNaN(keyRate) || keyRate <= 0) {
        alert('Пожалуйста, введите корректное значение максимальной ключевой ставки.');
        return;
    }

    for (let i = 1; i <= depositCount; i++) {
        const amountElement = document.getElementById(`amount${i}`);
        if (!amountElement) continue; // Если вклад был удален

        const amount = parseFloat(amountElement.value);
        const rate = parseFloat(document.getElementById(`rate${i}`).value);
        const term = parseFloat(document.getElementById(`term${i}`).value);
        const termTypeElement = document.getElementById(`termType${i}`);
        const termType = termTypeElement ? termTypeElement.value : 'months';
        const capitalizationElement = document.getElementById(`capitalization${i}`);
        const capitalization = capitalizationElement ? capitalizationElement.value : 'none';

        // Проверка корректности введенных данных
        if (isNaN(amount) || isNaN(rate) || isNaN(term)) {
            alert(`Пожалуйста, заполните все поля для вклада ${i} корректными значениями.`);
            return;
        }

        if (amount <= 0 || rate <= 0 || term <= 0) {
            alert(`Все значения для вклада ${i} должны быть положительными числами.`);
            return;
        }

        // Преобразование срока вклада в дни
        let termInDays;
        if (termType === 'months') {
            termInDays = term * 30; // Приблизительно
        } else if (termType === 'days') {
            termInDays = term;
        } else {
            termInDays = term * 30; // По умолчанию месяцы
        }

        // Расчет дохода по вкладу с учетом капитализации
        let income = 0;
        const annualRate = rate / 100;

        if (capitalization === 'none') {
            // Без капитализации
            const termInYears = termInDays / 365;
            income = amount * annualRate * termInYears;
        } else if (capitalization === 'monthly') {
            const periods = (termType === 'months') ? term : term / 30;
            const monthlyRate = annualRate / 12;
            income = amount * (Math.pow(1 + monthlyRate, periods) - 1);
        } else if (capitalization === 'daily') {
            const daysInYear = 365;
            const dailyRate = annualRate / daysInYear;
            income = amount * (Math.pow(1 + dailyRate, termInDays) - 1);
        }

        income = parseFloat(income.toFixed(2));
        totalIncome += income;

        // Расчет суммы налога
        const taxRate = 13 / 100; // Ставка налога 13%
        const termInYears = termInDays / 365;
        const nonTaxableIncome = amount * keyRate * termInYears;
        const taxBase = Math.max(income - nonTaxableIncome, 0);
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
