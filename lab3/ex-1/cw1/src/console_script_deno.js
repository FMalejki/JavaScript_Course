/**
 * @author Stanisław Polak <polak@agh.edu.pl>
 */
 
function read_sync() {
    console.log(`1.\t\x1B[32mWykonano pierwszą linię funkcji "read_sync()"\x1B[0m`);
    console.log('2.\t\x1B[33mWywołano funkcję \'readTextFileSync()\'\x1B[0m');
    const data = Deno.readTextFileSync(Deno.args[0]);
    console.log('3.\t\x1B[33mWczytano zawartość pliku — jest ona dostępna w zmiennej \'data\'\x1B[0m');
    console.log(`4.\t\x1B[32mWykonano ostatnią linię funkcji "read_sync()"\x1B[0m`);
}

function read_async() {
    console.log(`1.\t\x1B[32mWykonano pierwszą linię funkcji "read_async()"\x1B[0m`);
    console.log('2.\t\x1B[33mWywołano funkcję \'readTextFile()\'\x1B[0m');
    Deno.readTextFile(Deno.args[0]).then((data) => {
        console.log('3.\t\x1B[33mWczytano zawartość pliku — jest ona dostępna w zmiennej \'data\'\x1B[0m');
    })
    console.log(`4.\t\x1B[32mWykonano ostatnią linię funkcji "read_async()"\x1B[0m`);
}
/************************* */

if (Deno.args.length === 1) {
    console.clear()
    console.log(`\x1B[31mSynchroniczny odczyt pliku "${Deno.args[0]}"\x1B[0m`);
    read_sync();
    console.log('------------------');
    console.log(`\x1B[31mAsynchroniczny odczyt pliku "${Deno.args[0]}"\x1B[0m`);
    read_async();
    console.log('\t\x1B[34mWykonano ostatnią linię skryptu\x1B[0m');
}
else {
    console.log('Podaj nazwę pliku');
}