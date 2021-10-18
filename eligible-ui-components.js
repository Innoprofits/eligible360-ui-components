class EligibleCondition {
    constructor(options) {
        this.el = document.querySelector(options.el);
        this.onAnswer = options.onAnswer;
        this.labels = {
            next: options.next_label || 'Suivant'
        }
    }

    mountComponent(component){
        this.el.innerHTML = '';
        this.el.append(component);
    }

    render(condition) {
        let renderer = () => {
            switch (condition.input) {
                case 'Boolean':
                    return this.renderBoolean(condition);
                case 'Text':
                    return this.renderText(condition);
                case 'Select':
                    return this.renderSelect(condition);
                case 'Radio':
                    return this.renderRadio(condition);
                case 'Checkbox':
                    return this.renderCheckbox(condition);
            }
        }

        return condition.pre_condition_activated ?
            this.renderPreCondition(condition, () => renderer()) :
            renderer();
    }

    _createContentElement(content){
        let component = document.createElement('div');
        component.classList.add('eligible_condition');
        component.innerHTML = `<p class="content">${content}</p>`;
        return component;
    }

    _createButton(label, callback, classname = null) {
        let button = document.createElement('button');
        button.type = 'button';
        button.innerText = label;
        button.onclick = () => callback();
        if (classname) {
            button.classList.add(classname);
        }
        return button;
    }

    renderBoolean(condition) {
        let component = this._createContentElement(condition.content);

        let negativeButton = this._createButton(
            'Non',
            () => this.onAnswer(condition.id, 0),
            'negative'
        );
        let positiveButton = this._createButton(
            'Oui',
            () => this.onAnswer(condition.id, 1),
            'positive'
        );

        component.append(negativeButton);
        component.append(positiveButton);

        this.mountComponent(component);
    }

    renderPreCondition(condition, conditionRenderer) {
        let component = this._createContentElement(condition.pre_condition_content);

        let negativeButton = this._createButton(
            condition.negative_answer_label,
            () => this.onAnswer(condition.id, '_IGNORE_'),
            'precondition_skip'
        );
        let positiveButton = this._createButton(
            condition.positive_answer_label,
            () => conditionRenderer(),
            'precondition_next'
        );

        component.append(negativeButton);
        component.append(positiveButton);

        this.mountComponent(component);
    }

    renderText(condition) {
        let component = this._createContentElement(condition.content);
        let input = document.createElement('input');
        input.type = 'text';
        input.oninput = () => {
            input.classList.remove('validation_error');
            validationReqs.classList.remove('validation_error');
        }
        let validationReqs = document.createElement('p');
        validationReqs.classList.add('validation_text');
        validationReqs.innerText = condition.configuration.validation_reqs;

        let nextButton = this._createButton(this.labels.next, () => {
            if (condition.configuration.pattern && !input.value.match(condition.configuration.pattern)){
                validationReqs.classList.add('validation_error');
                input.classList.add('validation_error');
                return;
            }
            this.onAnswer(condition.id, input.value)
        }, 'next');

        component.append(input);
        component.append(validationReqs);
        component.append(nextButton);

        this.mountComponent(component);
    }

    renderSelect(condition) {
        let component = this._createContentElement(condition.content);
        let select = document.createElement('select');
        condition.configuration.options.forEach(option => {
            let optionEl = document.createElement('option');
            optionEl.value = option.id;
            optionEl.innerText = option.value;
            select.append(optionEl);
        });

        let nextButton = this._createButton(
            this.labels.next,
            () => this.onAnswer(condition.id, select.value),
            'next'
        );

        component.append(select);
        component.append(nextButton);

        this.mountComponent(component);
    }

    renderRadio(condition) {
        let component = this._createContentElement(condition.content);
        condition.configuration.options.forEach(option => {
            let label = document.createElement('label');
            let input = document.createElement('input');
            input.type = 'radio';
            input.name = condition.id;
            input.value = option.id;
            label.append(input);
            label.append(option.value);
            component.append(label);
        });

        let nextButton = this._createButton(this.labels.next, () => {
            this.onAnswer(condition.id, document.querySelector(`input[name=${condition.id}]:checked`).value);
        }, 'next');

        component.append(nextButton);

        this.mountComponent(component);
    }

    renderCheckbox(condition) {
        let component = this._createContentElement(condition.content);
        condition.configuration.options.forEach(option => {
            let label = document.createElement('label');
            let input = document.createElement('input');
            input.type = 'checkbox';
            input.name = condition.id;
            input.value = option.id;
            label.append(input);
            label.append(option.value);
            component.append(label);
        });

        let nextButton = this._createButton(this.labels.next, () => {
            this.onAnswer(
                condition.id,
                Array.from(document.querySelectorAll(`input[name=${condition.id}]:checked`))
                    .map(e => e.value)
            );
        }, 'next');

        component.append(nextButton);

        this.mountComponent(component);
    }
}
