import {Mail} from '../../../../model/rest/Mail';
import {MailKey} from '../../../../model/rest/MailKey';
import {MailExpression} from '../../../../model/rest/MailExpression';
import {IToastrService} from 'angular-toastr';

declare let angular: any;


export class MailListController {

    private mails: Mail[];
    private basicMail: Mail;
    private scope: any;
    private genExpressions: Array<string> = ['SERVICES_START', 'SERVICES_END'];

    /** @ngInject */
    constructor(private $q: any,
                private $scope,
                private $interpolate,
                private Restangular,
                private toastr: IToastrService,
                private $document: ng.IDocumentService,
                private $window: ng.IWindowService,
                mails: Mail[]) {
        $scope.ctrl = this;
        $scope.tableData = mails;
        this.mails = mails;
        this.basicMail = this.getBasicMail();
        this.scope = $scope;
    }

    public mailSort = (item: Mail) => item.type.order;

    getExpression = (exp: string) => {
        return exp !== '' && exp.indexOf('%') < 0 ? `%${exp}%` : exp;
    }

    public save(item: Mail) {

        this.prepareMailBody(item);

        /** Update array in controller at first*/
        this.mails.forEach((mail: Mail) => {
            if (mail.id === item.id) {
                mail = angular.copy(item);
            }
        });

        this.basicMail = this.getBasicMail();
        /** Save in DB */
        return this.Restangular
            .one('mails', item.id)
            .customPUT(item).then(() => {
                this.toastr.info('Mail template was updated successfully');
                this.scope.waitResponse = false;
            }, () => {
                this.toastr.info('Something went wrong');
            });
    }

    /**
     * Render expressions in Mail
     * @param {Mail} item
     * @returns {string}
     */
    public getMail(item: Mail): string {

        let compile = item.body;
        const literals = item.expressions;
        if (!compile) { compile = ''; }
        /**
         * Fix bug with editor
         * @type {RegExp}
         */
        this.prepareMailBody(item);

        if (this.isGeneratorBody(compile)) { compile = this.getGeneratorBody(compile, item.expressions); }

        compile = this.getTextBody(compile, item.expressions);

        if (!this.isBasicMail(item)) {
            return this.getBasicContent(compile);
        }
        return compile;

    }

    /**
     * Insert HTML to textEditor
     * @param text
     */
    public insertToEditor(text: string) {
        var sel, range;
        if (this.$window.getSelection) {
            sel = this.$window.getSelection();

            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                const element = range.commonAncestorContainer.parentElement.closest('[text-angular]');
                const editor = range.commonAncestorContainer.parentElement.closest('[contenteditable]');
                if (element != null) {
                    range.deleteContents();
                    range.insertNode(document.createTextNode(text));
                    editor.focus();
                }
            }
        }
    }

    private prepareMailBody(mail: Mail) {
        const regular = new RegExp(/<span id="selectionBoundary_\d+_\d+"[\s\S]*?(?!(<span))\<\/span\>/ig);
        mail.body = mail.body.replace(regular, '');
    }

    private isBasicMail(mail: Mail): Boolean {
        return mail.id === this.basicMail.id;
    }

    private isGeneratorBody(body: string): Boolean {
        if (!body) { body = ''; }

        let res: Boolean = false;
        this.genExpressions.forEach((exp) => {
            if (body.indexOf(exp) >= 0) { res = true; }
        });
        return res;
    }

    private getTextBody(body: string, literals: MailExpression[]): string {
        return body.replace(/%[^%\s]+%/ig, (match, p1, offset, string) => {
            const literal = match.replace(/[%]/g, '');
            let fLiteral = null;

            literals.forEach((exp) => {
                if (exp.expression === literal) {
                    fLiteral = exp.value;
                }
            });
            return fLiteral !== null ? fLiteral : match;
        });
    }

    private getGeneratorBody(body: string, literals: MailExpression[], count: number = 3): string {
        const reg: RegExp = new RegExp(`(?:%${this.genExpressions[0]}%)([\\s\\S]*)(?:%${this.genExpressions[1]}%)`, 'g');
        const repeatBody = body.match(reg); // generation sections

        repeatBody.forEach((section: string) => {

            const mStr: string = section.replace(reg, '$1');

            let totalStr: string = '';
            for (let i = 1; i <= count; i++) {
                totalStr += this.getTextBody(mStr, literals);
                literals.forEach((exp) => {
                    switch (exp.expression) {
                        case 'SERVICE_NUMBER': {
                            exp.value = <string>(1 + exp.value);
                        }
                    }
                });
            }
            body = body.replace(section, totalStr);
        });

        return body;
    }

    private getBasicMail(): Mail {
        const basicMail: Mail =
            this.mails.filter((item, index, array) => {
                return item.type.key === MailKey.BASIC;
            })[0];
        return angular.copy(basicMail);
    }

    private getBasicContent(text: string) {
        /** Check integrity of basic template */
        if (this.basicMail.body.indexOf('CONTENT') < 0) {
            return text;
        }

        this.basicMail.expressions.forEach((exp: MailExpression) => {
            if (exp.expression === 'CONTENT') {
                exp.value = text;
            }
        });
        return this.getMail(this.basicMail);
    }


}
