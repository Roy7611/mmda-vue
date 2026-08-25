export interface MetaUiSortValue {
  sortBy: string
  sortOrder: string
}

export interface MetaUiSortSet{
  sortName:string;
  sortTitle:string;
  sortSets:MetaUiSort[];
}

export interface MetaUiSort{
  sortLabel:string;
  sortSet: MetaUiSortValue;
  active:boolean;
}