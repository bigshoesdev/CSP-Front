/**
 * User information
 */
export interface User {
    id: number;
    name: string;
    password: string;
    email: string;
    locked: boolean;
    modules: string[];
}
