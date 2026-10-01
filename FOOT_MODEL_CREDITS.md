# Foot location model

The foot and lower-leg mesh is a cropped, twice-subdivided derivative of MakeHuman's `base.obj` (hm08). The foot texture is cropped from the MakeHuman system asset `young_lightskinned_male_diffuse.png`. Only the foot and lower-leg portion is shipped, not the complete body model/texture. The opposite side is mirrored for location selection.

Sources:
- Base mesh: https://github.com/makehumancommunity/makehuman/blob/master/makehuman/data/3dobjs/base.obj
- Model / skin asset license: CC0 1.0 Universal, https://github.com/makehumancommunity/makehuman/blob/master/LICENSE.ASSETS.md
- MakeHuman license clarification: https://github.com/makehumancommunity/makehuman/blob/master/LICENSE.md
- System skin pack (CC0): https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html

Source mesh credits: MakeHuman Community / Data Collection AB, Joel Palmius, Jonas Hauquier. Source skin credits: MakeHuman system assets (see original material metadata). Assets accessed 2026-10-01.

This is a realistically shaped generic model, not a scan of the user, nor a clinically validated anatomical atlas. Highlighted areas are approximate UI selection regions. The three internal ankle-joint choices are separately exposed; surface clicking does not infer internal anatomy. Unsupported toe tips/other toes are not silently remapped to a diagnosis-bearing location.

All 23 existing primary/secondary location combinations remain available by name. The UI changes how a location is selected; the scoring rules and evidence gates are unchanged. Additional answer fields: `foot_side`, `location_input`, `location_model_version`.

## Three.js

Three.js r128 is redistributed in `js/three.min.js` under the MIT License.
Copyright © 2010–2021 three.js authors.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
