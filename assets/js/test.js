let num = 10;

console.log('OUTPUT: num', num + 1);

let str = 'str';

console.log('OUTPUT: str', str + 1);

let func =() => {
    console.log('func1');
    console.log('func2');
    num = 100;
    str = `${num}`;
};