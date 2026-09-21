# Happy Animal Friends

A no-build, static preschool animal-learning website. It runs entirely in the browser and does not require any package installation or paid services.

## Preview locally

1. Open a terminal in the project directory:

   ```bash
   cd /workspace/happy-animal-friends
   ```

2. Start the included Python static web server:

   ```bash
   python3 -m http.server 4173
   ```

3. Open this exact address in a browser:

   ```text
   http://localhost:4173
   ```

4. Stop the preview server when you are done with `Ctrl+C` in the terminal.

The browser needs to be opened through the local server rather than by double-clicking `index.html`, because the site uses JavaScript modules.

## Publish with GitHub Pages

This repository includes a GitHub Actions workflow that publishes the static site to GitHub Pages. The site uses relative asset URLs (`styles.css` and `app.js`), so it works correctly at the GitHub Pages project subpath, such as `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

1. Push this branch to GitHub and open the repository page.
2. Click **Settings** in the repository navigation, then click **Pages** in the left sidebar.
3. Under **Build and deployment**, set **Source** to **GitHub Actions** and click **Save** if GitHub shows a save control.
4. Merge or push this workflow to the repository's `main` branch. The **Deploy static site to GitHub Pages** workflow will run automatically. Alternatively, open the **Actions** tab, select that workflow, click **Run workflow**, and choose the `main` branch.
5. Wait for the deployment job to complete. Open **Settings** → **Pages** and click the published site URL, which will be in the form `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.

The workflow can also be run manually from the **Actions** tab after GitHub Pages has been set to use GitHub Actions.

## What to try

- Select **Start Learning**, then tap an animal card.
- Tap the large speaker button to hear the animal phrase again (using the browser's built-in speech voice).
- Select **Next Animal** to continue learning.
- Select **Quiz** and choose one of the three animal answers to play the star-based game.
