import React from 'react';
import {Composition, Folder, Still} from 'remotion';
import {CUT_IDS, Cut, SCENES, cutDuration, getCut} from './Master';
import {Bumper, Thumbnail} from './scenes/Extras';
import {FPS} from './theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Livrables">
      {CUT_IDS.map((id) => {
        const c = getCut(id);
        return <Composition key={id} id={id} component={Cut} defaultProps={{cutId: id}} durationInFrames={cutDuration(c)} fps={FPS} width={c.w} height={c.h} />;
      })}
      <Composition id="Bumper6s" component={Bumper} durationInFrames={180} fps={FPS} width={1920} height={1080} />
      <Still id="MiniatureYouTube" component={Thumbnail} width={1280} height={720} />
    </Folder>
    <Folder name="Scenes">
      {SCENES.map((s) => (
        <Composition key={s.id} id={s.id} component={s.C} durationInFrames={s.dur} fps={FPS} width={1920} height={1080} />
      ))}
    </Folder>
    <Folder name="Scenes-9x16">
      {SCENES.map((s) => (
        <Composition key={s.id} id={`${s.id}v`} component={s.C} durationInFrames={s.dur} fps={FPS} width={1080} height={1920} />
      ))}
    </Folder>
  </>
);
