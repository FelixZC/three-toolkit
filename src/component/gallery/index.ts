import './index.css';

import Experience from './experience';
import img1 from '@/assets/images/rail-star/254a41dc4cbc8b5e0afaacf2eeb38890_8919910114589865353.png';
import img2 from '@/assets/images/rail-star/912bad8c0723b85a6a53f9b19323d3cd_7157411529622049660.png';
import img3 from '@/assets/images/rail-star/951b5cf2295ea158a29c80911e3eb55d_6539106821760568826.png';
import img4 from '@/assets/images/rail-star/69806d86868878c33ca22aa6dcc2571a_2237174096575525551.png';
import img5 from '@/assets/images/rail-star/b07fac008e99cae7387af773f4d4c039_1530443783740284969.png';
import img6 from '@/assets/images/rail-star/b1533de93c0ac43e2139bd93ec47419c_5547524982557108866.png';
import img7 from '@/assets/images/rail-star/efaa1ab4d1d567a478bdabda76121719_1637318133581363152.png';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div id="sketch"></div>
<div class="loader-screen">
    <div class="loading-container">
        <div class="loading">
            <span style="--i: 0">L</span>
            <span style="--i: 1">O</span>
            <span style="--i: 2">A</span>
            <span style="--i: 3">D</span>
            <span style="--i: 4">I</span>
            <span style="--i: 5">N</span>
            <span style="--i: 6">G</span>
        </div>
    </div>
</div>
<div class="gallery">
    <img class="gallery-item" src="${img1}" crossorigin="anonymous" alt="" />
    <img class="gallery-item" src="${img2}" crossorigin="anonymous" alt="" />
    <img class="gallery-item" src="${img3}" crossorigin="anonymous" alt="" />
    <img class="gallery-item" src="${img4}" crossorigin="anonymous" alt="" />
    <img class="gallery-item" src="${img5}" crossorigin="anonymous" alt="" />
    <img class="gallery-item" src="${img6}" crossorigin="anonymous" alt="" />
    <img class="gallery-item" src="${img7}" crossorigin="anonymous" alt="" />
</div>
`;

new Experience('#sketch');
