# enigma
A variation of the enigma machine to encrypt/decrypt strings

The enigma encryptor works by scrambling letters through a series of rotors that increment once for each character pressed. When one rotor makes a complete revolution the next rotor in the sequence increments one tick.

To understand how the Enigma machine works you can watch a simplified explanation [here](https://www.youtube.com/watch?v=ASfAPOiq_eQ&feature=youtu.be&t=103).

[Wikipedia: Enigma Machine](https://en.wikipedia.org/wiki/Enigma_machine)

Here is a diagram that shows what is happening inside the enigma machine:
![Diagram](https://res.cloudinary.com/practicaldev/image/fetch/s--2qwhwBZd--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/enigma-part-1/assets/enigma-schema.jpg)

One of the problems with the enigma machine used during WWII was that a character could not be encoded to itself - i.e. the character "A" could not be encoded to "A" but instead must result in one of the other 26 letters.

In addition, the enigma machine only encoded the letters of the alphabet.

<!-- To improve upon this design we are going to allow a character to be encoded to itself. We -->
To improve upon this design we are going to do 2 things:
1. We will allow a character to be encoded to itself.
2. Instead of only encoding the 26 letters of the English alphabet, we will instead encode all printable characters on the English keyboard. Thus allowing spaces and punctuation marks to be encoded as well!

Some things to note:
This is a tutorial on implementing an encryption/decryption algorithm and will therefore not put any focus on UI design.
This is the first of a series of tutorials and will be improved upon incrementally. As such, this first tutorial is going to be completely client side code. Which is one of the biggest weak points of this exercise and I will address this issue at the bottom of the page.

With that being said, lets begin the exercise of making an "enigma" machine.

In case you didn't watch the video or read the wikipedia article or know how the Enigma machine works at all here is a quick explanation. The Enigma machine works by having 3 different rotors (a fast rotor, a medium rotor, a slow rotor, and a reflector - which we will call rotor1, rotor2, rotor3, and rotor4 respectively in our algorithm below). The first 3 rotors have all the letters in the alphabet scrambled up in a way so that the input provides a different output. For example, in one of the rotors the character "A" will always map to the character "J" and in another rotor the character "J" will map to the character "E" and in the third rotor the character "E" will map to the character "P", then finally in the reflector the character "P" will map to the character "Y" (and "Y" will map to "P"). So after pressing "A" on the keyboard, we will go through the three rotors ending up with character "P" which maps to "Y" and then we go back through the three rotors again but in reverse order to get a final output character (lets say it's character "N"). Now that we entered a character and got an output, the fast rotor rotates by 1 tick until it has completed a full revolution, in which case the next rotor rotates by 1 tick and so on and so forth until all three rotors are reset back to their original positions. Now in our example of entering the letter "A" and receiving the letter "N", if we were to reset the three rotors and enter the letter "N", the machine should follow the same path in reverse order and give us the letter "A".

So our first task is to figure out how to implement the 3 rotors. Since the 3 rotors are just a scrambled mapping of one character to another character our first thought might be to make 3 different object maps. But then we would need a way to rotate each mapping. Since this would be require another object to keep track of the rotation order of each rotor, this would add unnecessary complexity to our algorithm. Instead, an easier solution would be to create 3 circular arrays of randomized characters. This would allow us to make a simple mapping that can be easily rotated. Then we would only be left with making the reflector rotor (which isn't really a rotor at all since it never rotates).


As mentioned above, we are going to make our algorithm more robust by allowing for all the printable characters on a standard QWERTY English keyboard, giving us a total of 95 characters that can be encoded.

Now that we know how we are going to implement the rotors, it's time to build them. We could make these arrays with the actual characters in them as such:
```
let rotor1 = ['x', 'e', 'f', '~', ...];
let rotor2 = ['b', '!', ' ', '_', ...];
etc...
```
But this would cause a few problems. First, it would be quite tedious to write all this out. Second, we would have to alternate between single and double quotes for certain characters: `let rotor1 = ['"', "'", ...];`. And that would cause unnecessary inconsistency. Instead, it would be much cleaner if we just used the ascii representation of each character and then convert that to it's proper character and vice versa. So lets write the code that would give us an array of every printable character in it's decimal ascii form.

```
function buildRotor() {
    let rotor = [];
    for (let i = 32; i <= 126; i++) {
        rotor.unshift(i);
    }
    return rotor;
}
```

You may be wondering why we decided to use `unshift()` instead of `push()` to prepend the elements to the rotor. I will explain this in just a moment.

For reference, here is a table of the ascii characters:
![ascii](http://www.asciitable.com/index/asciifull.gif)

Our buildRotor() function creates an array of integers representing the characters from `space` to `tilde(~)`.

Now we need to shuffle the rotors.

```
function shuffleRotor(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
        let tempVal = arr[i];
        let randI = Math.floor(Math.random() * i);
        arr[i] = arr[randI];
        arr[randI] = tempVal;
    }
    return arr;
}
```

Here we are looping through each element in the array (rotor) in reverse order and swapping the last index with a random index before the last index.

Using these two functions in combination will give us three rotors that can be used to scramble our input to a random output. But we still need a reflector rotor. We could make a custom mapping that will yield a proper reflection, but this can be tedious and time consuming. The more practical solution would be to make the "4th rotor" (the reflector) act like a mirror. That is, have the first character map to the last character, the second character map to the second to last character, and so on and so forth. This is why we used the `unshift()` method above when creating the rotors.

Now we have all four rotors built. The last thing to do is to implement the encoding algorithm. The steps are simple:

1. Loop through each character that needs to be encoded.
2. Find the position of this character in rotor1 (the fast rotor) to give us a new character.
3. Find the position of this character in rotor2 (the medium rotor) to give us another character.
4. Find the position of this character in rotor3 (the slow rotor) to give us yet another character.
5. Use rotor4 (the reflector) to find the position of the mirrored character.
6. Find the output character by repeating steps 4, 3, and 2 (in that order).
7. Now rotate the fast rotor (rotor1) by 1 position and rotate the other rotors when a complete revolution of the previous rotor has occurred.

Here is the code:
```
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
```

You may notice that I used a little jQuery here. That's because we are going to echo out the encoded characters to the screen in an html element.

To see this code in action, clone the repo and visit the index.html page on your localhost - or even your own server if you so desire ;)

**As mentioned earlier this solution has a major weakness. It's all on the client side!! That means, if anyone has access to this page they can simply read the javascript code and use the key to decode any encrypted text. So the question now becomes how do we conceal the values of our rotors? The basic answer is to move the javascript code to the server and write an API to create the rotors and do the encoding/decoding. Another issue is that each time the page is loaded, the rotors are regenerated and thus cause a new encryption pattern. This isn't useful if we want to be able to decode our encryption at a later time. I will address these issues in the next tutorial.**