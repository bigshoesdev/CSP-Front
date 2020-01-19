declare let angular: any;

/** @ngInject */
export function mailTable() {
    return {
        templateUrl: 'app/components/moduleSettings/components/mailList/directives/mailTable/mailTable.html',
        restrict: 'A',
        scope: {
            mailItem: '=mailTableData'
        },
        link: function postLink(scope, el, iAttrs, controller) {
            scope.bodyText = '';
            if (scope.mailItem.body == null) {
                scope.mailItem.body = '';
            }

            scope.$watch('$parent.ctrl.basicMail.body', function() {
                // redraw preview
                scope.preview = scope.$parent.ctrl.getMail(scope.mailItem);
            });

            scope.color = '#FF0000';

            this.editor = el[0].querySelector('div[text-angular] div[contenteditable]');
            let expression = '';
            let dragEl;

            cacheMail();
            /**
             * Bind editor events
             */
            this.editor.addEventListener('dragover', function (e) {
                this.classList.add('editorSelected');
            });

            this.editor.addEventListener('dragleave', function (e) {
                if (e.srcElement == this.editor) {
                    this.classList.remove('editorSelected');
                }
            });

            this.editor.addEventListener('drop', function (e) {
                this.classList.remove('editorSelected');
                clearDrag();
            });

            function cacheMail() {
                scope.mailItem.cacheBody = scope.mailItem.body;
            }

            function clearDrag() {
                if (dragEl) {
                    document.body.removeChild(dragEl);
                }
                dragEl = null;
            }

            scope.dStart = ($event: any) => {
                window.getSelection().removeAllRanges();

                expression = $event.srcElement.getAttribute('data-value');
                expression = scope.$parent.ctrl.getExpression(expression);
                clearDrag();
                dragEl = $event.srcElement;

                $event.dataTransfer.setData('text/plain', expression);
                $event.dataTransfer.dropEffect = 'copy';


                dragEl = $event.srcElement.cloneNode(true);
                dragEl.setAttribute('style', `position: absolute;
                    background: rgb(158,204,78);
                    position: absolute; top: -150px;
                    border: 0;`);
                document.body.appendChild(dragEl);
                $event.dataTransfer.setDragImage(dragEl, 0, 0);
            };

            scope.dDrag = ($event: any) => {
                if ($event.stopPropagation) {
                    $event.stopPropagation();
                }
            };

            scope.expressionClick = (val: string) => {
                scope.$parent.ctrl.insertToEditor(
                    scope.$parent.ctrl.getExpression(val)
                );
            };

            scope.onEdit = () => {
                scope.isEdit = true;
            };

            scope.onSave = () => {
                scope.isEdit = false;
                scope.isPreview = false;
                scope.$parent.ctrl.save(scope.mailItem).then(() => {
                    cacheMail();
                    scope.preview = scope.$parent.ctrl.getMail(scope.mailItem);
                });
            };

            scope.onPreview = (isPreview) => {
                scope.isPreview = isPreview;
                scope.preview = scope.$parent.ctrl.getMail(scope.mailItem);
            };

            scope.onCancel = () => {
                scope.isEdit = false;
                scope.mailItem.body = scope.mailItem.cacheBody;
            };

            scope.color = 'rgb(0, 0, 0)';

            scope.options = {
                placeholder: 'My Color',
                inputClass: 'form-control',
            };

            scope.api = {
                onOpen: function() {
                    console.log('opened');
                },
                onClose: function() {
                    console.log('closed');
                },
                onBlur: function() {
                    console.log('blurred');
                },
                onDestroy: function() {
                    console.log('destroyed');
                },
                onChange: function(event, color) {
                    console.log('changed', color);
                },
            };
        }
    };


}
