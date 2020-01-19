import {ClientSimpleMatchingInfoItem} from './ClientSimpleMatchingInfoItem';

export interface ClientSimpleMatchingInfo {
    // Holds info about clietns matching records grpuped by dates
    date: string;
    items: ClientSimpleMatchingInfoItem[];
}
