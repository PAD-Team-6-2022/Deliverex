const TRANSITION_DURATION = 100;
const TRANSITION_DISTANCE = 10;

document.querySelectorAll('[data-tooltip]').forEach((el) => {
    const text = el.getAttribute('data-tooltip');
    const orientation = el.getAttribute('data-tooltip-orientation') || 'top';
    const tooltip = document.createElement('div');
    const wrapper = document.createElement('div');

    // The amount of pixels of offset from the element
    // at the end of the transition
    const endOffset =
        (orientation === 'top' || orientation === 'bottom'
            ? el.clientHeight
            : el.clientWidth) +
        (Number(el.getAttribute('data-tooltip-offset')) || 20);

    // The starting offset is the offset before
    // starting with the transition
    const startOffset = endOffset - TRANSITION_DISTANCE;

    // Set a relation position on the wrapper
    // to contain the icon within the input
    wrapper.classList.add('relative');

    // Wrapping it around the tooltip toggle
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);

    // Adding the necessary tailwind styles
    tooltip.classList.add(
        'absolute',
        'z-10',
        'p-2',
        'bg-slate-900',
        'rounded-md',
        'text-slate-50',
        'pointer-events-none',
        orientation === 'top'
            ? 'bottom-0'
            : orientation === 'bottom'
            ? 'top-0'
            : orientation === 'left'
            ? 'right-0'
            : 'left-0',
        orientation === 'right' ? 'top-0' : 'bottom-0',
    );

    // Setting the text of the tooltip using the
    // data-tooltip attribute of the element
    tooltip.innerText = text;

    // The transform styling that is used
    // at the start of the transition, this
    // will be used after entering and
    // before leaving the DOM
    const startTransform =
        orientation === 'top'
            ? `translateY(-${startOffset}px)`
            : orientation === 'bottom'
            ? `translateY(${startOffset}px)`
            : orientation === 'left'
            ? `translateX(-${startOffset}px)`
            : `translateX(${startOffset}px)`;

    // This will fire when the user hovers over the element
    el.addEventListener('mouseenter', () => {
        wrapper.appendChild(tooltip);

        // Animate the tooltip to fade-in
        tooltip.animate(
            [
                {
                    opacity: 0,
                    transform: startTransform,
                },
                {
                    opacity: 1,
                    transform:
                        orientation === 'top'
                            ? `translateY(-${endOffset}px)`
                            : orientation === 'bottom'
                            ? `translateY(${endOffset}px)`
                            : orientation === 'left'
                            ? `translateX(-${endOffset}px)`
                            : `translateX(${endOffset}px)`,
                },
            ],
            {
                duration: TRANSITION_DURATION,
                fill: 'forwards',
            },
        );
    });

    // This will fire when the user hovers off the element
    el.addEventListener('mouseleave', () => {
        // Animate the tooltip to fade-out
        tooltip.animate(
            [
                {
                    opacity: 1,
                },
                {
                    opacity: 0,
                    transform: startTransform,
                },
            ],
            {
                duration: TRANSITION_DURATION,
                fill: 'forwards',
            },
        );

        // Make sure the tooltip completes its animation before
        // removing it from the DOM
        setTimeout(() => {
            //wrapper.removeChild(tooltip);
        }, TRANSITION_DURATION);
    });
});
