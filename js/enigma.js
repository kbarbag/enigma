let r1, r2, r3, r4;
let rotor1, rotor2, rotor3, rotor4;
let count1 = 0;
let count2 = 0;
let count3 = 0;

function buildRotor() {
    let rotor = [];
    for (let i = 32; i <= 126; i++) {
        rotor.unshift(i);
    }
    return rotor;
}

function printArr(arr) {
    return arr.reduce((total, curr) => total + ', ' + curr);
}

function shuffleRotor(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
        let tempVal = arr[i];
        let randI = Math.floor(Math.random() * i);
        arr[i] = arr[randI];
        arr[randI] = tempVal;
    }
    return arr;
}

function encode(inputText) {
    //step 1
    for (let i = 0; i < inputText.length; i++) {
        //convert the character into it's ascii decimal representation
        let currIndex = inputText.charCodeAt(i) - 32;

        //check to see if we have a new line
        if (currIndex == -22) {
            $('#output').val($('#output').val() + '\n');
            continue;
        }
        //sanity check to make sure we are not encoding a non printable character
        if (currIndex < 0 || currIndex > 94) {
            continue;
        }

        //steps 2-4
        currIndex = rotor1[currIndex] - 32;
        currIndex = rotor2[currIndex] - 32;
        currIndex = rotor3[currIndex] - 32;

        //step 5
        currIndex = rotor4[currIndex];

        //step 6 (i.e. steps 4, 3, and 2)
        currIndex = rotor3.indexOf(currIndex) + 32;
        currIndex = rotor2.indexOf(currIndex) + 32;
        currIndex = rotor1.indexOf(currIndex) + 32;

        //convert decimal character to ascii character
        let outputChar = String.fromCharCode(currIndex);
        $('#output').val($('#output').val() + outputChar);

        //step 7
        let tempVal = rotor1.shift();
        rotor1.push(tempVal);
        count1 += 1;
        if (count1 >= 95) {
            count1 = 0;
            tempVal = rotor2.shift();
            rotor2.push(tempVal);
            count2 += 1;
            if (count2 >= 95) {
                count2 = 0;
                tempVal = rotor3.shift();
                rotor3.push(tempVal);
                count3 += 1;
                if (count3 >= 95) {
                    count3 = 0;
                }
            }
        }
        tempVal = rotor4.shift();
        rotor4.push(tempVal);
    }
}

function encodePress() {
    if (event.charCode == 13) {
        $('#output').val($('#output').val() + '\n');
        return;
    } else if (event.charCode == 8) {
        let outputText = $('#output').val();
        outputText = outputText.slice(0, -1);
        $('#output').val(outputText);
        let inputText = $('#input').val();
        inputText = inputText.slice(0, -1);
        $('#input').val(inputText);
        return;
    }
    encode(event.key);
}

function resetRotors() {
    rotor1 = r1.slice();
    rotor2 = r2.slice();
    rotor3 = r3.slice();
    rotor4 = r4.slice();
    count1 = 0;
    count2 = 0;
    count3 = 0;
}

function rewind() {
    let tempVal = rotor4.pop();
    rotor4.unshift(tempVal);
    tempVal = rotor1.pop();
    rotor1.unshift(tempVal);
    count1 -= 1;
    if (count1 < 0) {
        count1 = 94;
        tempVal = rotor2.pop();
        rotor2.unshift(tempVal);
        count2 -= 1;
        if (count2 < 0) {
            count2 = 94;
            tempVal = rotor3.pop();
            rotor3.unshift(tempVal);
            count3 -= 1;
            if (count3 < 0) {
                count3 = 94;
            }
        }
    }
}

$(function () {
    r1 = shuffleRotor(buildRotor());
    r2 = shuffleRotor(buildRotor());
    r3 = shuffleRotor(buildRotor());
    r4 = buildRotor();
    resetRotors();
    $('body').on("keydown", function (e) {
        console.log("keydown");
        if (e.which === 8 && $(e.target).is("input, textarea")) {
            console.log("back space");
            e.preventDefault();
            if ($('#input').val().length === 0) {
                return;
            }
            let outputText = $('#output').val();
            outputText = outputText.slice(0, -1);
            $('#output').val(outputText);
            let inputText = $('#input').val();
            inputText = inputText.slice(0, -1);
            $('#input').val(inputText);
            rewind();
        }
    });
    $('body').on('click', '#encodeMe', function () {
        resetRotors();
        $('#output').val('');
        encode($('#input').val());
    });

    $('body').on('click', '#select', function () {
        $('#output').select();
        document.execCommand("copy");
    });
});