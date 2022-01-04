# Discord File System

This repository contains a Discord bot for uploading & downloading files stored in a Discord channel using attachments and chained list of messages. 
This allows to virtually unlimited storage. 

**This code has been created for research purpose only. Using this code for actually storing data inside discord servers could get you into legal troubles and is probably against the terms of use.
**

## Usage

At first, you will need to create a discord bot and add it to your server ([https://discord.com/developers/applications](here)). 

Install [https://nodejs.org/](node.js) and go to the `bot/` directory containing the node.js files and install dependencies. And create the `/tmp/dfs/` folder (hardcoded in `main.js`): 

```
:~/dfs/# cd bot/
:~/dfs/bot/# npm install
:~/dfs/bot/# mkdir /tmp/dfs/
```

Copy the `.env.default` to `.env` and specify the *authentication token* of your Discord bot.

Copy the file `conf.json.default` to `conf.json` and specify your *server ID* and the storage *channel ID*. The files database path can also be modified.


Finally, call the CLI using `node dfs.js`. Use the *up*, *dl*, *ls* and *rm* commands to manage your files. Here is an example:

```
:~/dfs/bot/# node dfs.js up ../test/test.png
uploaded test.png (id=42).
:~/dfs/bot/# node dfs.js up dfs.js 
uploaded dfs.js (id=752260).
:~/dfs/bot/# node dfs.js up ~/bigfile.zip 
uploaded bigfile.zip (id=986824).
:~/dfs/bot/# node dfs.js ls
╔═───══════════╤══════════╤═══════╤════════╤════════════════════╤══════════════════════════╗
║ Name         │ Size     │ Nodes │ ID     │ LMI                │ Date                     ║
╟──────────────┼──────────┼───────┼────────┼────────────────────┼──────────────────────────╢
║ test.png     │ 11.95 kB │ 1     │ 42     │ 244608795576356038 │ 2022-01-04T19:34:11.987Z ║
╟──────────────┼──────────┼───────┼────────┼────────────────────┼──────────────────────────╢
║ dfs.js       │ 4.67 kB  │ 1     │ 752260 │ 244681421454901643 │ 2022-01-04T19:34:45.621Z ║
╟──────────────┼──────────┼───────┼────────┼────────────────────┼──────────────────────────╢
║ bigfile.zip  │ 93.48 MB │ 10    │ 986824 │ 244694212497037452 │ 2022-01-04T19:38:15.837Z ║
╚═════════───══╧══════════╧═══════╧════════╧════════════════════╧══════════════════════════╝

:~/dfs/bot/# node dfs.js dl 42 ~/dl.png.
saved test.png at ~/dl.png.
```

## Licence

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
THE SOFTWARE IS INTENDED TO BE USED FOR RESEARCH PURPOSE ONLY.

