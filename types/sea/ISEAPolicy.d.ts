interface ISEAPolicyTree{
    "+"?:string|ISEAPolicyTree,
    "#"?:string|ISEAPolicyTree, 
    "."?:string|ISEAPolicyTree, 
    "="?:string|ISEAPolicyTree, 
    "*"?:string|ISEAPolicyTree, 
    ">"?:string|ISEAPolicyTree, 
    "<"?:string|ISEAPolicyTree
}


interface ISEAPolicySingle extends ISEAPolicyTree{
    read?:string |ISEAPolicyTree,
    write?:string|ISEAPolicyTree,
}

export declare type ISEAPolicy = ISEAPolicySingle |string | string[] | ISEAPolicySingle[]