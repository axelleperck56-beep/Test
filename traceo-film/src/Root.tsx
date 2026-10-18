import React from 'react';
import {Composition, Folder} from 'remotion';
import {Master, SCENES, masterDuration} from './Master';
import {FPS} from './theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Master" component={Master} durationInFrames={masterDuration()} fps={FPS} width={1920} height={1080} />
    <Folder name="Scenes">
      {SCENES.map((s) => (
        <Composition key={s.id} id={s.id} component={s.C} durationInFrames={s.dur} fps={FPS} width={1920} height={1080} />
      ))}
    </Folder>
  </>
);
