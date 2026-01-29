import { Composition } from 'remotion';
import { SkyAnimation } from './SkyAnimation';

// Video configuration
const FPS = 30;
const DURATION_SECONDS = 20; // Full day/night cycle in 20 seconds

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SkyAnimation"
        component={SkyAnimation}
        durationInFrames={FPS * DURATION_SECONDS}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
