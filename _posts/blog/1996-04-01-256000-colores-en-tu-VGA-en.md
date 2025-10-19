---
title: 256,000 colors on your VGA (EN)
excerpt: "Reverse‑engineering VGA memory tricks to push past the 256-color barrier in 1996."
tags: [rpp]
lang: en
ref: 256000-colores
modified: 2025-10-19
comments: true
image:
  feature: 1996-04-01-256000-colores-en-tu-VGA/RPP-header.jpg
permalink: /en/blog/256000-colores-en-tu-vga/
---

<section id="table-of-contents" class="toc">
  <header>
    <h3>Overview</h3>
  </header>
<div id="drawer" markdown="1">
*  Auto generated table of contents
{:toc}
</div>
</section><!-- /#table-of-contents -->

This was my first publication in a professional magazine: RPP. RPP (Revista Profesional para Programadores) was a *state-of-the-art magazine* in Spain in those days. I bought it every month and read articles from important people like [Ricardo Devis Botella](http://www.casadellibro.com/libro-c-stl-plantillas-excepciones-rules-y-objetos/9788428323628/553988).

At that time, I had an expensive PC with a VGA display card... and a lot of time to search gopher and usenet in the early Internet (before the WWW existed). I found some articles by [Michael Abrash](https://en.wikipedia.org/wiki/Michael_Abrash) that showed the internals of the VGA...

Using that new knowledge, some of my abundant time, and the principles of television (Red + Green + Blue = any color), I managed to show 256,000 colors on a VGA (which could only show 256!)

<figure class="half">
    <a href="/images/1996-04-01-256000-colores-en-tu-VGA/RPP-cover.jpg"><img src="/images/1996-04-01-256000-colores-en-tu-VGA/RPP-cover.jpg"></a>
    <a href="/images/1996-04-01-256000-colores-en-tu-VGA/RPP-page-1.jpg"><img src="/images/1996-04-01-256000-colores-en-tu-VGA/RPP-page-1.jpg"></a>
    <figcaption>Cover and first article page</figcaption>
</figure>

---

## 256,000 colors on your VGA (article body)

When the VGA card came out, I found it hard to believe that, sooner or later, those 256 colors would fall short. Several years have passed since then. Ray-tracing techniques, texture mapping, etc., have developed to such an extent that true-color graphics capabilities are now needed.

Currently, most PC computers have SuperVGA graphics cards. These cards, successors to the VGA, provide higher resolution but not more colors. Color is expensive, and a card that exceeds the imposed barrier of 256 colors is something that is not within the reach of the average user.

Applications that require a large number of colors must choose between two alternatives: either reduce the color space from 16 million to 256 (see RPP No. 8: Color Presentation in VGA Modes), or apply complex optimal color selection algorithms. The first is the fastest, so it has real-time application, but sometimes the reduction is too strong. The second, with application in static images, requires a lot of calculation time and, when the image has too many colors, the results are not as good as would be desirable.

With this perspective, any method that solves the problem is always welcome, even if it is far from perfect. As always, you have to give to get. We will gain a lot of colors; we just have to see if what we have to give is worth it.

### ...yes, but how?

Every color on the screen can be broken down into three primary components: a little red, a little blue, and some green. By changing the proportions of these three primary colors, we can form the entire color spectrum.

When we choose the VGA palette, it allows us to assign to each color, from 0 to 255, three numbers from 0-63 each that indicate how much of each primary color that color will have. This means that we can select a color from among 64x64x64 = 256,144 available colors. On some cards, the primary colors can be selected from 0-255, so the choice reaches up to 256^3 = 16,777,216 colors. This selection gives us the first key to the colors, but something more is needed.

The human eye has a certain visual inertia. This means that it retains the impression of an image for a certain time. This fact makes television possible, and as a classic case, animation or cartoons. In these, each frame is presented for a time short enough for the sensation of movement to be perfect. This means that we cannot appreciate intermediate planes and that adding them would be superfluous, since the effect has already been achieved. Visual inertia gives us the second key to colors. We just have to open the door.

If we are able to deliver three images in the time that the eye perceives one, and each of them is formed by different tones of a primary color, the eye will not see the three colors, but the resulting color from superimposing them. This is the technique. All that remains is to find the right method to carry it out, and this is where the difficulties begin.

### To the maximum of colors

From what has been said, it follows that we must be able to create 3 color planes for each image. Graphic formats that support true color, such as TGA, already have the image broken down into the three primary planes, each with 256 possible tones. Therefore, we must focus on how to draw each of the planes.

Ideally, the VGA would have 256x3 colors to select from. This would allow us to assign the 256 shades of red to the first 256 colors, the 256 shades of green to the next 256 colors, and the last ones for blue.

Unfortunately, we only have 256 and we can only select 64 tones. With these limitations, we will assign the different tones of each primary color in blocks of 64 colors. Thus, for example, we will paint the red primary plane with the colors from 0 to 63, which have been assigned with all those of this color.

This forces us to take the 6 most significant bits of the true color image to adapt it to our 64 tones.

### Maximum speed

Presenting the three primary planes at the necessary speed for them to be perceived as one is not easy. It is not enough to copy the images to the video memory over and over again. This would be really slow.

To achieve high speeds, you have to resort to programming at the VGA register level. It is not that it is difficult, but it is a topic unknown to the general public.

The objective of this article is not to explore advanced VGA programming, so I will only explain what is strictly necessary and in a very simplified way. In addition, I will restrict myself to the case of the VGA.

The first thing you need to know is that when we program in mode 13h (typical mode at 320x200 and 256 colors) we are wasting 3/4 of the VGA memory.

Although it may be surprising, mode 13h is what is known as a chained mode that, in a somewhat peculiar way, reduces four 64k blocks to a single one, which is the one we see on the screen.

If we unchain the memory, we will have at our disposal a wonderful 256k of video memory (this is the first thing the mysterious Mode X does).

Another of the fantastic possibilities offered by programming at the register level is to select the block, within the 256k, that we want to see on the screen. This selection is almost instantaneous, so it will allow us to achieve the high speeds we were looking for.

In effect, if we place the red, green, and blue planes in the first, second, and third 64k blocks and cyclically select the blocks, we will be able to present them with sufficient frequency for the color superposition effect to occur.

### Problems, solutions, and improvements

The theory is quite simple but, as usual, implementing it is not. Let's imagine that we already have the three primary planes in the video memory.

The first problem we encounter is that if we change the block when the image is halfway, we will see a not at all pleasant jump in the image. To avoid this, what we must do is wait for the image to finish tracing, so as not to leave it halfway, and for the vertical retrace to begin.

The `WaitRetrace()` function takes care of this task.

The second problem arises when solving the first. Waiting for the vertical retrace means that the image presentation frequency is limited to the frequency with which the image is refreshed on the screen.

Mode 13h makes the VGA operate at 25Mhz, which entails a presentation of more than 50 and less than 70 images per second. The eye does not distinguish more than 28 planes per second, so for a single image it is more than enough. However, if we present three color planes for each image, it seems obvious that it is necessary to be able to present about 90 planes per second (30 for each primary plane) so that we see about 30 complete images.

This can be solved by increasing the working frequency of the VGA. By making it work at 28Mhz, the number of planes per second increases significantly. Unfortunately, some monitors become unstable at these frequencies and the number of planes presented has to be reduced.

Despite all these improvements we make, we cannot present the planes fast enough. The eye, which is very sensitive to color changes, perceives the abrupt change from one primary color to another, and we get a very annoying jumpy image.

The problem arises because we are going from a large surface of, for example, red color to another large surface of, for example, green color.

The solution to this problem is to mix the planes. Each plane will have points of the three colors, but arranged in such a way that the superposition of the three planes gives us the same image. With this simple trick, we manage to reduce the color surfaces.

The astute reader will have observed that there are many ways to mix the planes. Indeed. The ideal would be to mix the planes in such a way that the maximum continuous surface of a primary color is reduced to a single pixel. That is, in a plane, each primary color should be surrounded only by pixels of the other two colors. In practice, this is impossible.

The simplest approach is to present red-green-blue sequences. The drawback is that this always leaves continuous lines of primary colors that the eye perceives, although much less than when they were large surfaces. Since the pixels are square, the maximum continuity occurs with horizontal and vertical lines.

To reduce the continuity of the color, we will opt for diagonal lines. In this, the pixels only touch at one corner and the color continuity is less. The diagonal line approach makes them visible and slightly blurs the image, although the results are quite good.

I challenge anyone from here to find a more suitable mixture that gives better results. I am aware that there is some arrangement that reduces the continuity to a few pixels, perhaps two or three. Going from a line with about a hundred contiguous points to just a few should greatly improve the results.

Programming at the VGA register level allows us an additional improvement. Another of the peculiarities of mode 13h is that its pixels are approximately square. This is known to everyone. What most do not know is that these points are double points. When the VGA paints a pixel on the screen, it is actually painting two, one on top of the other. The result is a square pixel. We can tell the VGA not to double the pixels, with which the screen will have dimensions of 320x400. We will thus see the content of the first two 64k blocks but the images will appear flattened, as the pixels are now rectangular. As the pixels have reduced their area by half, the color continuity also decreases. So that the images do not appear flattened, each line of the image is drawn twice. We thus gain quality at the cost of memory. Since we only have 256k of memory, to have three planes with this rectangular pixel resolution, we must reduce the size of the image to 240x180 points (which on the screen will be 240x360 and which multiplied by 3 planes is less than 256k).

### Program Example

Listing 1 shows an example of a program that uses this technique. The program begins by establishing a graphic mode of 240x180x256k. It is small in size because it works with double vertical resolution and uses doubled pixels (which consume a lot of memory because half are repeated).

It continues by running a free animation cycle. This means that the three screens are shown cyclically, but we can continue with the program (I recommend that the curious take a look at these functions, as they are very interesting).

To see a sample of colors, we draw a wide range of colors on the screen, and we enter a loop where we are allowed to modify the frequency with which the free animation is called. Play a little to see the effect.

To exit the loop, just press space. Once out of the loop, the free animation is deactivated and an animation with a key press wait begins. The results are better in this type of animation and it is the most suitable for presenting static images.

{% highlight c linenos %}
{% raw %}
/*****************************************************************************
 Listing 1
*****************************************************************************/
/*--------------------------------------------------------------------------
   VGA256K1.c - Demonstration of the color gamut
  --------------------------------------------------------------------------
   OBJECTIVE: To offer a sample of the library's possibilities.
  --------------------------------------------------------------------------
   In this program, a total of 30*30*30=27,000 colors are displayed on the
   screen. The colors have been selected in such a way that the entire
   color space of 64x64x64 is covered, leaving intermediate tones unshown.
  --------------------------------------------------------------------------*/
#include <conio.h>
#include "vga256k.h"

/*--------------------------------------------------------------------------
   main() - Main function
  --------------------------------------------------------------------------*/
main()
{
	/*--- Variables used ---*/
	unsigned r, g, b, Key, Freq;

	/*--- Set the 240x180x256k graphics mode ---*/
	SetHigh240x180x256k();

	/*--- Activate the animation ---*/
	ActivateAnimation2();

	/*--- Paint a sample of 30 tones for each primary color.
	      We use PutPixelHigh256k() to double the points ---*/
	for(b=2;b<32;++b){
	for(g=2;g<32;++g){
	for(r=0;r<32;++r){
	 PutPixelHigh256k( (r%8)*30+b-2, (int)(r/8)*30+g-2, r*2,b*2,g*2);
	}}}

	/*--- Allow increasing or decreasing the refresh rate ---*/
	Freq=176;
	while(1){
		Key=getch();
		if(Key==' ') break;
		if(Key=='+'){ ++Freq; ChangePIT(Freq); }
		if(Key=='-'){ --Freq; ChangePIT(Freq); }
	}

	/*--- Deactivate the animation ---*/
	DeactivateAnimation();

	/*--- Another way: Animate until a key is pressed: the 's' ---*/
	AnimateUntilKey('s');

       /*--- Wait for a key. Restore text mode ---*/
	SetVideoMode(3);

}
/*****************************************************************************/
{% endraw %}
{% endhighlight %}

### Applications

The main application is the obvious one: presenting images in almost real color.

The ability to display so many colors simultaneously allows presenting several images on the screen regardless of the palettes of each one. In general, the procedure is useful in all those programs where intensive use is made of the color palette, or the representation speed prevents it from being changed.

This technique applied to a SuperVGA can lead to high-quality results as much more memory (1 Mb), higher resolution, and a higher clock frequency are available. I have tried it myself on a Paradise VGA at 640x400 and the results are excellent.