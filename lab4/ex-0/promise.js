/**
 * @author Stanisław Polak <polak@agh.edu.pl>
 */

function createPromise(num) {
    return new Promise((resolve, reject) => {
        console.log(`The constructor of the Promise#${num} object was called`);
        setTimeout(() => {
            const divider = Math.floor(Math.random() * 3);
            if (divider != 0)
                resolve(10 / divider); // Fulfill the promise
            else
                reject("Attempt to divide by 0"); // Reject the promise
        }, 2000);
    });
}
// ---------------------
// Using the 'then()' and 'catch()' methods
// ---------------------
console.log('\x1b[42mBefore .try()/.catch()\x1b[0m');
createPromise(1)
    .then((result) => {
        console.group('Promise#1');
        console.log('Division result:', result);
        console.groupEnd('Promise#1');
    })
    .catch((err) => {
        console.group('Promise#1');
        console.error('An error occurred!', err);
        console.groupEnd('Promise#1');
    });
console.log('\x1b[42mAfter .try()/.catch()\x1b[0m');
console.log('-'.repeat(30));
// ---------------------
// Using the 'async' and 'await' keywords
// ---------------------
console.log('\x1b[46mBefore "async"\x1b[0m');
// Creating an asynchronous function and calling it
(async () => {
    let result;

    console.log('\x1b[34mBefore the "try/catch" block\x1b[0m');
    try {
        console.log('\x1b[31mBefore "await"\x1b[0m');
        result = await createPromise(2);
        console.log('\x1b[31mAfter "await"\x1b[0m');
        console.group('Promise#2');
        console.log('Division result:', result);
        console.groupEnd('Promise#2');
    } catch (err) {
        console.group('Promise#2');
        console.error('An error occurred!', err);
        console.groupEnd('Promise#2');
    }
    console.log('\x1b[34mAfter the "try/catch" block\x1b[0m');
})
    ();
console.log('\x1b[46mAfter "async"\x1b[0m');
console.log('-'.repeat(30));
console.warn('Reached the last line of the script'); 