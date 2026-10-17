import React from 'react';

interface ContourLinesProps {
  /** "ink" for paper backgrounds, "cream" for the dark ink band */
  tone?: 'ink' | 'cream';
  className?: string;
}

// Hand-shaped elevation rings around a "hill" in the bottom-right corner, like a hiking map.
// Rings are spaced further apart than they wobble, so no two lines ever cross.
// The outer three are hidden on phones to keep small screens quiet.
const RINGS = [
  'M735 558 C737 555 745 544 750 538 C754 532 759 528 761 523 C763 518 763 513 763 507 C764 501 762 493 763 486 C764 479 766 471 770 465 C774 460 780 455 786 452 C793 449 800 448 807 447 C814 446 820 445 827 445 C834 444 845 444 848 444',
  'M702 565 C700 560 696 546 694 536 C691 526 687 515 686 504 C686 493 686 481 690 470 C694 460 700 450 707 441 C715 433 724 426 733 419 C742 412 751 406 761 401 C771 395 781 389 792 387 C803 384 815 382 826 383 C837 385 852 393 858 395',
  'M625 579 C623 572 614 549 613 534 C611 519 614 502 617 487 C621 472 628 457 635 443 C643 429 651 416 660 404 C670 391 680 378 692 368 C704 358 718 349 732 343 C747 338 763 335 779 335 C794 334 810 338 824 341 C839 344 859 349 866 351',
  'M552 593 C551 583 548 552 549 532 C550 512 553 492 557 472 C561 452 567 432 576 414 C584 395 595 377 608 362 C622 347 639 334 656 324 C674 314 694 309 712 303 C731 298 750 295 768 291 C786 287 804 283 823 279 C842 276 872 271 882 269',
  'M503 602 C503 591 505 555 507 531 C509 507 510 485 514 461 C517 438 520 413 528 390 C536 367 546 343 559 322 C573 302 592 283 611 267 C630 252 653 239 675 228 C698 218 722 209 746 203 C770 197 795 192 820 191 C845 190 883 196 896 197',
  'M443 614 C440 600 427 558 425 529 C422 500 422 469 427 440 C433 411 443 381 456 354 C469 328 487 303 506 280 C525 257 547 235 570 216 C593 197 618 179 644 166 C671 152 700 141 729 135 C758 129 789 127 819 130 C848 132 890 146 905 149',
  'M354 631 C352 613 343 561 344 526 C344 492 347 455 355 422 C364 388 377 354 394 324 C411 294 435 266 459 242 C483 217 511 197 539 178 C567 159 596 143 625 128 C655 112 684 96 716 84 C748 72 782 59 816 54 C851 48 905 51 923 51',
  'M282 645 C280 624 270 564 271 524 C273 485 280 444 289 405 C299 366 313 328 330 292 C348 256 368 220 393 189 C418 157 447 128 479 104 C512 80 549 61 585 47 C622 33 662 24 700 18 C738 11 777 9 815 8 C854 7 912 10 931 10',
];

const TONE = {
  // ink at ~6% on paper; the ink token turns cream in dark mode, shown at ~8%
  ink: 'text-ink/[0.06] dark:text-ink/[0.08]',
  cream: 'text-[#F6F1E7]/[0.08]',
};

export const ContourLines: React.FC<ContourLinesProps> = ({ tone = 'ink', className = '' }) => (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 800 520"
    preserveAspectRatio="xMaxYMax meet"
    className={`pointer-events-none absolute ${TONE[tone]} ${className}`}
  >
    <g fill="none" stroke="currentColor" strokeWidth="1">
      {RINGS.map((d, i) => (
        <path key={d} d={d} vectorEffect="non-scaling-stroke" className={i >= 5 ? 'max-sm:hidden' : undefined} />
      ))}
    </g>
  </svg>
);
