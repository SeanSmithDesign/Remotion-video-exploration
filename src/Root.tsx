import { Composition } from 'remotion';
import { SkyAnimation } from './SkyAnimation';
import { StageMicrophone } from './StageMicrophone';

// Video configuration
const FPS = 30;
const DURATION_SECONDS = 20; // Full day/night cycle in 20 seconds

// Stage Microphone config (9:16 vertical for Twitter/mobile)
const STAGE_DURATION_SECONDS = 12;

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
      <Composition
        id="StageMicrophone"
        component={StageMicrophone}
        durationInFrames={FPS * STAGE_DURATION_SECONDS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};
