export interface IGunTree{
    "+"?:string|IGunTree,
    "#"?:string|IGunTree, 
    "."?:string|IGunTree, 
    "="?:string|IGunTree, 
    "*"?:string|IGunTree, 
    ">"?:string|IGunTree, 
    "<"?:string|IGunTree,
    '-'?:string|number|IGunTree
}