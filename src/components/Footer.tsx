export function Footer() {
  return (
    <footer className="p-6 text-center mt-auto w-full box-border text-sm">
      <p className="my-4">From Montréal, Canada 🍁</p>
      <hr className="my-4" />
      <p className="my-4">
        You can contact me at simon@simoncrypta.dev <br /> for any good reason 🙂
      </p>
      <hr className="my-4" />
      <a href="https://github.com/simoncrypta/simoncrypta" aria-label="GitHub profile" className="text-[var(--color-text)]">
        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 16 16" width="20" className="inline-block align-middle">
          <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
      </a>
      <a href="https://x.com/simoncrypta" className="ml-4 text-[var(--color-text)]" aria-label="X (Twitter) profile">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 462.799" fill="none" className="inline-block align-middle">
          <path fill="currentColor" fillRule="nonzero" d="M403.229 0h78.506L310.219 196.04 512 462.799H354.002L230.261 301.007 88.669 462.799h-78.56l183.455-209.683L0 0h161.999l111.856 147.88L403.229 0zm-27.556 415.805h43.505L138.363 44.527h-46.68l283.99 371.278z"/>
        </svg>
      </a>
    </footer>
  );
}
