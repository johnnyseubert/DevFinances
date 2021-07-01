const Modal = {
    OpenClose() {
        document.querySelector('.modal-overlay').classList.toggle('active')
    },
}
// Cria um localStorage no navegador
const Storage = {
    set(transactions) {
        localStorage.setItem('Minhas:transactions', JSON.stringify(transactions))
    },
    get() {
        return JSON.parse(localStorage.getItem('Minhas:transactions')) || []
    }
}
// Faz os calculos das Entradas saídas e Totais e adição e remoção de linha
const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes() {
        let income = 0
        Transaction.all.forEach((transaction) => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income
    },

    expenses() {
        let expenses = 0
        Transaction.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                expenses += transaction.amount
            }
        })
        return expenses
    },

    total(incomes, expenses) {
        return Transaction.incomes() + Transaction.expenses()
    }
}
// Manipula a tabela no html
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    // cria o HTML completo da tabela
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },

    // Preenche os valores da tabela
    innerHTMLTransaction(transaction, index) {
        const TypeAmount = transaction.amount > 0 ? 'income' : 'expense'
        const amount = Utils.formatCurrency(transaction.amount)
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${TypeAmount}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Removar Transação">
            </td>
            `
        return html
    },

    updateBalance() {
        document.querySelector('#incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.querySelector('#expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.querySelector('#totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}
// Formata a moeda
const Utils = {
    formatAmount(value) {
        value = value * 100
        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : ''
        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    }

}
// Manipulação do formulário
const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()

        if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
            throw new Error('Por favor preencha todos os campos')
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()
        try {
            Form.validateFields()                   // Validar campos
            const transaction = Form.formatValues() // Formatar campos
            Transaction.add(transaction)            // salvar
            Form.clearFields()                      // apagar dados do formulario
            Modal.OpenClose()                       // fechar o modal
        } catch (error) {
            alert(error.message)
        }
    }
}

// Iniciar aplicação
const App = {
    init() {
        // Preenche a tabela
        Transaction.all.forEach(DOM.addTransaction)
        DOM.updateBalance()
        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()

    }
}
App.init()