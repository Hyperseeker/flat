# What
`flat` is a freeform note-taking app in the browser.
It works similar to Microsoft OneNote, in that you can create and drag your note anywhere on the page.
It's not meant to be a serious project. It is, at best, an unfinished chunk of what it could be.

# Why
I needed something to do with code away from [Intergrid](https://intergrid.online).
While researching ways to handle setting the correct caret position for editing nodes in Intergrid, I came upon a piece of code that allowed one to create an element at the position of a click. It was an interesting possibility I thought would be nice to explore.
`flat` is the result of this exploration.

# Capabilities
* create notes anywhere on the page by clicking on the background
* remove notes by clicking on the closing icon
* drag notes anywhere within the limits of the viewport
* resize notes in any direction, including via corner-dragging

# Limitations

* **User can accidentally move the note to the opposite side for the starting width of the note if they resize top and/or left side**. I figured out why it was happening: the height/width changes from resizing affected the position of the note when the value dove below the starting value of the dimension. I was unable to resolve this with calculations alone, and anything else would prove too cumbersome to handle for an experiment.

* **User is unable to resize the note vertically below its content's height**. This probably has to do with how the CSS engine handles `.content` element's box. Additionally, **there's no mechanism in place to handle the overflow** if it were to ever be resized.

* **Notes are not saved**. There's no way to export them automatically, either.

* **Clicks must be precise**. Moving the mouse between `mousedown` and `mouseup` (i.e. between pressing the key down and releasing it) will not trigger click events, such as closing of the note. This is because within the confines of the engine, clicks are defined as "`mousedown` followed by `mouseup` if mouse's current and previous X and Y coordinates are the same".

* **Buttons are not discriminated against for determining clicks**. This means you can achieve the same thing using any button on your mouse: left, right, middle, or any of the additional ones.

* **The background grid is meaningless**. It's there because the page looks nicer and more note-like with it. Notes are not snapped to the grid.

# Potential Improvements

* **Allow user to create the note of any size by allowing dragging before `mouseup`**. Cutting the path between the two actions in a note-taking environment where note size is a not-insignificant component may be beneficial for the user experience. Current design paradigm declares that it should only be used *in conjunction with* click-creating notes, not *instead of*.

* **Add saving and restoring of notes**.

* **Add undo system**. This was attempted but never finalized, and cut for the release version. Within the confines of this engine, it would be best to register actions on `mouseup`, except for note creation, which happens on `mousedown`. Register finished drag, finished resizing, creation, and deletion of notes.

* **Add the option of grid-snapping**. Make it optional and non-default, and make the grid square a fraction of the visible grid. Some users may prefer to keep the dots of the grid outside their notes, rather than pin the note onto the dots.

* **Add note pages and note categories**. Replicate OneNote hierarchical structure for the benefit of compartmentalized note-taking. Auxiliary research suggests it to be a desired quality for a non-insignificant fraction of the potential userbase.

# Applications

* **Open-source counterpart to OneNote**. Auxiliary research suggests there's a market for that

* **More freeform mind-mapping software**. Add lines and arrows to create a whole another layer of functionality.

* **Note-within-note hierarchical structure**. Storing notes within notes *ad infinitum* may be a viable solution for certain types of note-taking.