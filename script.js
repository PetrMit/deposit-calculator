function calculate() {
    // Получение значений из формы
    const amount = parseFloat(document.getElementById('amount').value);
    const rate = parseFloat(document.getElementById('rate').value);
    const term = parseInt(document.getElementById('term').value);

    // Проверка корректности введенных данных
    if (isNaN(amount) || isNaN(rate) || isNaN(term)) {
        alert('Пожалуйста, заполните все поля корректными значениями.');
        return;
    }

    if (amount <= 0 || rate <= 0 || term <= 0) {
        alert('Все значения должны быть положительными числами.');
        return;
    }

    // Расчет общего дохода
    const interest = amount * (rate / 100) * (term / 12);
    const totalIncome = interest.toFixed(2);

    // Расчет суммы налога
    const taxFreeRate = 0.01; // Не облагаемый налогом процент (ставка ЦБ)
    const taxRate = 13 / 100; // Ставка налога 13%
    const taxBase = Math.max(interest - amount * (taxFreeRate * term / 12), 0);
    const taxAmount = (taxBase * taxRate).toFixed(2);

    // Вывод результатов
    document.getElementById('totalIncome').innerText = totalIncome;
    document.getElementById('taxAmount').innerText = taxAmount;
}