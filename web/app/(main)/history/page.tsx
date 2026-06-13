'use client';

import { useEffect } from 'react';
import { ContentContainer } from 'components/ContentContainer';
import { HistoryTopPanel } from 'modules/history/HistoryTopPanel';
import { HistoryWrapper } from 'modules/history/HistoryWrapper';
import { useRootStore } from 'store/root';

export default function History() {
  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'History',
    });
  }, [trackEvent]);
  return (
    <>
      <HistoryTopPanel />
      <ContentContainer>
        <HistoryWrapper />
      </ContentContainer>
    </>
  );
}
