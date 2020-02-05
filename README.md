# Add Divolte to your project

1. setup environment to angular 8 project.
   ```bash
   ng add @gmsca/ngdivolte
   ```
   all divolta related source code will be added.
2. modify the `divolte.js` position in `environment.ts` file.
   ```ts
   export const environment = {
     divolteUrl: '<your divolte.js location>/divolte.js',
     ...
   };
   ```
3. Try it

   - find a html file for testing, like `app.component.html`. create a button element with `appInputTracker` directive.

     ```html
     <button appInputTracker>any button</button>
     ```

   - also, add a `eventName`
     ```html
     <button appInputTracker eventName="next">any button</button>
     ```

4. if the divolte backend is running, **click** the button, then receive a json data.
