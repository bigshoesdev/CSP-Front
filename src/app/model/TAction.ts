export interface TAction {
    fn: (model: any, event: any) => void;
    buttonClass: string;
    label: string;
    iconName: string;
}
