# chrome-extension-website-blocker

This Chrome extension blocks a list of user-specified domains and subdomains. The motivation was to experiment with Chrome Manifest V3 while creating a tool that helps me focus on learning and building new technology (win-win).

Built with JavaScript, HTML, CSS, with testing using Puppeteer and Jest.


# How to use

1. `git clone` this repo to a local directory
2. Navigate to [chrome://extensions](chrome://extensions) on the Chrome browser
3. Toggle on "Developer mode"
4. Click on "Load unpacked" and in the popup, navigate to the folder where this repo was saved and select the root folder
5. Once the extension is loaded, it should be displayed under "All extensions"
6. Locate and pin the extension
7. Click on the extension, and add a new URL, formatted as domain.tld or subdomain.domain.tld (ex: espn.go.com or linkedin.com)
9. Navigate to the domain - it should be blocked

For any questions, refer to instructions on the Google Chrome page, [Load an unpacked extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).
