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

        <label for="startDate${depositCount}">Дата начала вклада:</label>
        <input type="date" id="startDate${depositCount}" name="startDate${depositCount}" required>

        <label for="endDate${depositCount}">Дата окончания вклада:</label>
        <input type="date" id="endDate${depositCount}" name="endDate${depositCount}" required>

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

    const keyRate = parseFloat(document.getElementById('keyRate').value);

    if (isNaN(keyRate) || keyRate <= 0) {
        alert('Пожалуйста, введите корректное значение максимальной ключевой ставки.');
        return;
    }

    for (let i = 1; i <= depositCount; i++) {
        const amountElement = document.getElementById(`amount${i}`);
        if (!amountElement) continue; // Если вклад был удален

        const amount = parseFloat(amountElement.value);
        const rate = parseFloat(document.getElementById(`rate${i}`).value);
        const startDateValue = document.getElementById(`startDate${i}`).value;
        const endDateValue = document.getElementById(`endDate${i}`).value;
        const capitalizationElement = document.getElementById(`capitalization${i}`);
        const capitalization = capitalizationElement ? capitalizationElement.value : 'none';

        // Проверка корректности введенных данных
        if (isNaN(amount) || isNaN(rate) || !startDateValue || !endDateValue) {
            alert(`Пожалуйста, заполните все поля для вклада ${i} корректными значениями.`);
            return;
        }

        if (amount <= 0 || rate <= 0) {
            alert(`Сумма и процентная ставка для вклада ${i} должны быть положительными числами.`);
            return;
        }

        const startDate = new Date(startDateValue);
        const endDate = new Date(endDateValue);

        if (endDate <= startDate) {
            alert(`Дата окончания вклада ${i} должна быть позже даты начала.`);
            return;
        }

        // Расчет срока вклада в днях
        const termInDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

        // Расчет дохода по вкладу с учетом капитализации
        let income = 0;
        const annualRate = rate / 100;

        if (capitalization === 'none') {
            // Без капитализации
            const termInYears = termInDays / 365;
            income = amount * annualRate * termInYears;
        } else if (capitalization === 'monthly') {
            // Расчет количества полных месяцев и оставшихся дней
            const monthsDifference = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
            const dayDifference = endDate.getDate() - startDate.getDate();

            let fullMonths = monthsDifference;
            let remainingDays = dayDifference;

            if (dayDifference < 0) {
                fullMonths -= 1;
                const previousMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
                remainingDays = previousMonth.getDate() - startDate.getDate() + endDate.getDate();
            }

            // Доход за полные месяцы с капитализацией
            const monthlyRate = annualRate / 12;
            const amountAfterMonths = amount * Math.pow(1 + monthlyRate, fullMonths);

            // Доход за оставшиеся дни по простой процентной ставке
            const dailyRate = annualRate / 365;
            const incomeForRemainingDays = amountAfterMonths * dailyRate * remainingDays;

            income = (amountAfterMonths - amount) + incomeForRemainingDays;
        } else if (capitalization === 'daily') {
            // Ежедневная капитализация
            const dailyRate = annualRate / 365;
            income = amount * (Math.pow(1 + dailyRate, termInDays) - 1);
        }

        income = parseFloat(income.toFixed(2));
        totalIncome += income;
    }

    totalIncome = parseFloat(totalIncome.toFixed(2));

    // Расчет суммы налога
    const nonTaxableAmount = 1000000 * (keyRate / 100);
    const taxBase = Math.max(totalIncome - nonTaxableAmount, 0);
    const taxRate = 13 / 100; // Ставка налога 13%
    const totalTax = parseFloat((taxBase * taxRate).toFixed(2));

    // Вывод результатов
    totalIncomeElement.innerText = totalIncome;
    taxAmountElement.innerText = totalTax;

    document.getElementById('result').style.display = 'block';
}
