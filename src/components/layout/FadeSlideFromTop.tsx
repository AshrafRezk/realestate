import {
  cloneElement,
  forwardRef,
  type ReactElement,
  type Ref,
  useRef,
} from 'react'
import { Transition } from 'react-transition-group'
import type { TransitionProps } from '@mui/material/transitions'
import getReactElementRef from '@mui/utils/getReactElementRef'
import useForkRef from '@mui/utils/useForkRef'

const ENTER_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)'
const EXIT_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'
const OFFSET_PX = 40

function transitionCss(ms: number, easing: string) {
  return `opacity ${ms}ms ${easing}, transform ${ms}ms ${easing}`
}

function getStateStyle(state: string) {
  if (state === 'entered' || state === 'entering') {
    return { opacity: 1, transform: 'translateY(0)' }
  }
  if (state === 'exiting') {
    return { opacity: 0, transform: 'translateY(-20px)' }
  }
  return { opacity: 0, transform: `translateY(-${OFFSET_PX}px)` }
}

function reflow(node: HTMLElement) {
  node.scrollTop
}

/**
 * Dialog transition: fades in while sliding from top to bottom.
 */
const FadeSlideFromTop = forwardRef(function FadeSlideFromTop(
  {
    addEndListener,
    appear = true,
    children,
    easing,
    in: inProp,
    onEnter,
    onEntered,
    onEntering,
    onExit,
    onExited,
    onExiting,
    style,
    timeout = 500,
    ...other
  }: TransitionProps & { children: ReactElement },
  ref: Ref<unknown>,
) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const handleRef = useForkRef(nodeRef, getReactElementRef(children), ref)

  const enterMs = typeof timeout === 'number' ? timeout : (timeout.enter ?? 500)
  const exitMs = typeof timeout === 'number' ? timeout : (timeout.exit ?? 400)
  const enterEase = typeof easing === 'object' ? (easing.enter ?? ENTER_EASING) : (easing ?? ENTER_EASING)
  const exitEase = typeof easing === 'object' ? (easing.exit ?? EXIT_EASING) : (easing ?? EXIT_EASING)

  const normalizedTransitionCallback =
    (callback?: TransitionProps['onEnter']) => (maybeIsAppearing?: boolean) => {
      const node = nodeRef.current
      if (!node || !callback) return
      if (maybeIsAppearing === undefined) {
        callback(node)
      } else {
        callback(node, maybeIsAppearing)
      }
    }

  const handleEnter = normalizedTransitionCallback((node, isAppearing) => {
    reflow(node)
    node.style.transition = transitionCss(enterMs, enterEase)
    onEnter?.(node, isAppearing)
  })

  const handleEntering = normalizedTransitionCallback(onEntering)
  const handleEntered = normalizedTransitionCallback(onEntered)
  const handleExiting = normalizedTransitionCallback(onExiting)

  const handleExit = normalizedTransitionCallback((node) => {
    node.style.transition = transitionCss(exitMs, exitEase)
    onExit?.(node)
  })

  const handleExited = normalizedTransitionCallback(onExited)

  const handleAddEndListener = (next: () => void) => {
    if (addEndListener && nodeRef.current) {
      addEndListener(nodeRef.current, next)
    }
  }

  return (
    <Transition
      appear={appear}
      in={inProp}
      nodeRef={nodeRef}
      timeout={timeout}
      onEnter={handleEnter}
      onEntering={handleEntering}
      onEntered={handleEntered}
      onExit={handleExit}
      onExiting={handleExiting}
      onExited={handleExited}
      addEndListener={handleAddEndListener}
      {...other}
    >
      {(state, childProps) =>
        cloneElement(children, {
          style: {
            ...getStateStyle(state),
            visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
            ...style,
            ...children.props.style,
          },
          ref: handleRef,
          ...childProps,
        })
      }
    </Transition>
  )
})

export default FadeSlideFromTop
