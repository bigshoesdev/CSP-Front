export interface BaseColumnDefinition {
    id: number;
    title: string;
    type: any;
    position: number;

    customColumnId?: number;
    selectColumnId?: number;
}
