export interface BaseColumn {
    id: number;
    title: string;
    type: any;
    position: number;  // If null - column marked as hidden.
    editable?: boolean; // Whether values of the column edited?
    permanent?: boolean; // If permanent the column can't be removed or be hidden.

    customColumn?: any;
    selectColumn?: any;
}
