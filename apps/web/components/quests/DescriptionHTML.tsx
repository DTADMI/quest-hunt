'use client';

import DOMPurify from 'dompurify';

type Props = {
    html: string | null | undefined;
    className?: string;
};

export function DescriptionHTML({html, className}: Props) {
    if (!html) return null;
    const safe = DOMPurify.sanitize(html);
    return <div className={className} dangerouslySetInnerHTML={{__html: safe}}/>;
}
