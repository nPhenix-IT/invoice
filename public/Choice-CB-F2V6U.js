import{a as e}from"./rolldown-runtime-CNC7AqOf.js";import{t}from"./jsx-runtime-CTknu7_t.js";import{r as n}from"./colors-0MwZ3ngc.js";import{at as r,st as i}from"./forms-2V6SBcK1.js";var a=e(t(),1),o=i.button`
  transition: border-color 150ms ease, background-color 150ms ease;

  &:hover:not(:disabled) {
    background-color: ${e=>e.theme.hover};
  }

  &:focus-visible {
    outline: 2px solid ${e=>e.theme.focus};
    outline-offset: 2px;
  }
`;function s({selected:e,onSelect:t,title:i,detail:s,trailing:c}){let l=r(),u=n();return(0,a.jsxs)(o,{type:`button`,role:`radio`,"aria-checked":e,onClick:t,theme:{hover:u.$25,focus:l},className:`w-full flex items-center gap-3 text-left px-3.5 py-2.5 border`,style:{borderRadius:`0.375rem`,borderColor:e?u.$3:u.$24,backgroundColor:u.$1},children:[(0,a.jsx)(`div`,{"aria-hidden":!0,className:`shrink-0 grid place-items-center`,style:{width:`1rem`,height:`1rem`,borderRadius:`999px`,border:`1px solid ${e?u.$3:u.$5}`},children:e?(0,a.jsx)(`div`,{style:{width:`0.5rem`,height:`0.5rem`,borderRadius:`999px`,backgroundColor:u.$3}}):null}),(0,a.jsxs)(`div`,{className:`min-w-0 flex-1`,children:[(0,a.jsx)(`span`,{className:`block text-sm`,style:{color:u.$3,fontWeight:500},children:i}),s?(0,a.jsx)(`span`,{className:`block text-xs mt-0.5`,style:{color:u.$17},children:s}):null]}),c?(0,a.jsx)(`span`,{className:`shrink-0 text-xs`,style:{color:u.$17},children:c}):null]})}export{s as t};